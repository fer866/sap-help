import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import { GuideApiService } from 'src/app/api-services/guide-api.service';
import { Step } from 'src/app/entities/guide';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'cjf-step-edit',
  templateUrl: './step-edit.component.html',
  styleUrls: ['./step-edit.component.scss']
})
export class StepEditComponent implements OnInit {
  private readonly maxFileSize: number = Math.pow(2, 20) * 20; //10 Mb
  stepForm = new FormGroup({
    file: new FormControl(null),
    fileSource: new FormControl(null),
    transactionTxt: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
    stepTxt: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]),
    fileUrl: new FormControl(null)
  });
  imageUrl?: SafeUrl;
  fileName?: string;
  dragOver: boolean = false;
  fileTypes: string[] = ['image/','application/pdf','application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain','application/xml','text/xml'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: StepDialog,
    public dialogRef: MatDialogRef<StepEditComponent>,
    private service: GuideApiService,
    private snack: SnackbarService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    if (this.data.step) {
      this.stepForm.patchValue({
        transactionTxt: this.data.step.transactionTxt,
        stepTxt: this.data.step.stepTxt,
        fileUrl: this.data.step.fileUrl,
        fileSource: this.data.step.fileUrl ? new File([], 'file') : null
      });
      if (this.data.step.fileUrl && this.data.step.isImage) {
        this.imageUrl = this.data.step.fileUrl;
      } else if (this.data.step.fileUrl) {
        const idx = this.data.step.fileUrl.lastIndexOf('/');
        this.fileName = this.data.step.fileUrl.slice(idx);
      }
    } else if (this.data.previousTransaction) {
      this.stepForm.patchValue({ transactionTxt: this.data.previousTransaction });
    }
  }

  onSubmit(): void {
    if (this.stepForm.invalid) {
      this.stepForm.markAsTouched();
      this.stepForm.markAsDirty();
      return;
    }
    const value = this.setStepForm();
    if (this.data.step) {
      this.service.updateGuideStep(value).pipe(take(1)).subscribe(_ => this.onResetAndClose());
    } else {
      this.service.addGuideStep(value).pipe(take(1)).subscribe(_ => this.onResetAndClose());
    }
  }

  private onResetAndClose(): void {
    this.stepForm.reset();
    this.dialogRef.close({ result: 'ok' } as StepDialog);
  }

  onCancel(): void {
    this.stepForm.reset();
    this.dialogRef.close({ result: 'cancel' } as StepDialog);
  }

  onResetFile(): void {
    this.stepForm.patchValue({ file: null, fileSource: null, fileUrl: null });
    this.imageUrl = this.fileName = undefined;
    this.dragOver = false;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = input.files;
      if (!this.fileTypes.some(t => files[0].type.includes(t))) {
        this.snack.open('Lo siento, el tipo de archivo no es compatible');
        return;
      }
      if (files[0].size > this.maxFileSize) {
        const mbSize: number = this.maxFileSize / Math.pow(2, 20);
        this.snack.open(`Alto ahí, excediste el tamaño máximo de ${mbSize} Mb`);
        return;
      }
      this.stepForm.patchValue({ fileSource: files[0] });
      this.getImageUrl();
    }
  }

  onPasteFile(e: ClipboardEvent): void {
    this.validateFile(e.clipboardData?.items);
    e.clipboardData?.items.clear();
  }

  private getImageUrl(): void {
    const value = this.stepForm.controls.fileSource.value;
    if (value && (value as File).type.indexOf('image') >= 0) {
      const url = (window.URL || (window as any).webkitURL || window || {}).createObjectURL(value);
      this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
    } else if (value) {
      this.fileName = (value as File).name;
    }
  }

  dropHandler(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.dragOver = false;
    this.validateFile(e.dataTransfer?.items);
    e.dataTransfer?.items.clear();
  }

  dragOverHandler(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.dragOver = true;
  }

  dragLeaveHandler(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.dragOver = false;
  }

  private validateFile(items?: DataTransferItemList): void {
    if (!items) {
      this.snack.open('No se encontró algún archivo compatible');
      return;
    }
    let idx: number = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') { idx = i; }
    }
    if (idx < 0) {
      this.snack.open('No se encontró algún archivo compatible');
      return;
    }
    const file = items[idx].getAsFile();
    if (!file) {
      this.snack.open('No se encontró algún archivo compatible');
      return;
    }
    if (!this.fileTypes.some(t => file.type.includes(t))) {
      this.snack.open('Lo siento, el tipo de archivo no es compatible');
      return;
    }
    if (file.size > this.maxFileSize) {
      const mbSize: number = this.maxFileSize / Math.pow(2, 20);
      this.snack.open(`Alto ahí, excediste el tamaño máximo de ${mbSize} Mb`);
      return;
    }
    this.stepForm.patchValue({ fileSource: file });
    this.getImageUrl();
  }

  private setStepForm(): FormData {
    const step = this.stepForm.value;
    const form = new FormData();
    form.append('file', step.fileSource);
    form.append('step.idStep', this.data.step?.idStep?.toString() || '0');
    form.append('step.idGuide', this.data.idGuide?.toString() || '0');
    form.append('step.transactionTxt', step.transactionTxt || '');
    form.append('step.stepTxt', step.stepTxt || '');
    form.append('step.fileUrl', step.fileUrl || '');
    return form;
  }

}

export class StepDialog {
  idGuide?: number;
  previousTransaction?: string;
  result?: 'ok' | 'cancel' | 'error';
  step?: Step;
}