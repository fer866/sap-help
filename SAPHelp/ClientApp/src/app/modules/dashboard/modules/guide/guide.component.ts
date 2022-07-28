import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, Subject } from 'rxjs';
import { finalize, switchMap, take, takeUntil } from 'rxjs/operators';
import { GuideApiService } from 'src/app/api-services/guide-api.service';
import { Step } from 'src/app/entities/guide';
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from '@angular/material/chips';
import { CategoryApiService } from 'src/app/api-services/category-api.service';
import { Category } from 'src/app/entities/category';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmData, ConfirmDialogComponent } from 'src/app/modules/confirm-dialog/confirm-dialog.component';
import { StepDialog, StepEditComponent } from './components/step-edit/step-edit.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DOCUMENT } from '@angular/common';
import { PhotoService } from 'src/app/services/photo.service';
import { Title } from '@angular/platform-browser';
import { Clipboard } from '@angular/cdk/clipboard';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'cjf-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss']
})
export class GuideComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  guide = new FormGroup({
    idCat: new FormControl(null, Validators.required),
    title: new FormControl(null, [Validators.required, Validators.minLength(5), Validators.maxLength(200)]),
    alta: new FormControl({ disabled: true, value: null }),
    views: new FormControl({ disabled: true, value: null }),
    lastView: new FormControl({ disabled: true, value: null }),
    tags: new FormControl(null)
  });
  listSteps: Step[] = [];
  noInfo: boolean = false;
  idGuide?: number;
  newGuide: boolean = false;
  editGuide: boolean = false;
  tags: string[] = [];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  categories: Observable<Category[]> = EMPTY;
  editSteps: boolean = false;
  orderSteps: boolean = false;

  constructor(
    private service: GuideApiService,
    private route: ActivatedRoute,
    private catService: CategoryApiService,
    private router: Router,
    private dialog: MatDialog,
    @Inject(DOCUMENT) private doc: Document,
    private photoService: PhotoService,
    private title: Title,
    private clipboard: Clipboard,
    private snack: SnackbarService
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.categories = this.catService.getCategories();

    this.route.paramMap.pipe(
      switchMap(p => {
        if (p.has('id')) {
          if (Number(p.get('id'))) {
            this.title.setTitle('Editar guía | SAP Help');
            this.idGuide = Number(p.get('id'));
            return this.service.getGuideById(this.idGuide).pipe(
              finalize(() => this.getGuideSteps())
            );
          } else {
            this.title.setTitle('Nueva guía | SAP Help');
            this.newGuide = true;
            return EMPTY;
          }
        } else {
          return EMPTY;
        }
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe(g => {
      this.guide.patchValue(g);
      this.guide.controls.tags.setValue(null);
      this.guide.disable();
      this.tags = g.tags?.split(',') || [];
    });
  }

  addTag(e: MatChipInputEvent): void {
    const value = (e.value || '').trim();
    if (value) {
      this.tags.push(value);
      this.guide.controls.tags.setValue(null);
    }
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.guide.invalid || this.tags.length <= 0) {
      this.guide.markAsTouched();
      this.guide.markAsDirty();
      return;
    }

    const value = this.guide.value;
    value.tags = this.tags.join(',');
    if (this.newGuide) {
      this.service.addGuide(value).pipe(takeUntil(this.unsubscribe$)).subscribe(g => {
        this.idGuide = g.idGuide;
        this.newGuide = false;
        this.router.navigate(['/dashboard/guides', this.idGuide]);
        this.getGuide();
      });
    } else if (this.editGuide) {
      value.idGuide = this.idGuide;
      this.service.updateGuide(value).pipe(takeUntil(this.unsubscribe$)).subscribe(g => {
        this.editGuide = false;
        this.getGuide();
      });
    }
  }

  private getGuide(): void {
    this.service.getGuideById(this.idGuide || 0).pipe(take(1)).subscribe(g => {
      this.guide.reset();
      this.guide.patchValue(g);
      this.guide.controls.tags.setValue(null);
      this.guide.disable();
      this.tags = g.tags?.split(',') || [];
    });
  }

  private getGuideSteps(): void {
    this.service.getGuideSteps(this.idGuide || 0).pipe(take(1)).subscribe(s => this.listSteps = s);
  }

  getFileType(step: Step): string {
    const idx = step.fileUrl?.lastIndexOf('.') || 0 + 1;
    const type = step.fileUrl?.slice(idx) || '';
    return 'Descargar archivo ' + type.toUpperCase();
  }

  onEditHeader(): void {
    if (this.editGuide) {
      this.editGuide = false;
      this.getGuide();
    } else {
      this.editGuide = true;
      this.guide.enable();
    }
  }

  onDeleteGuide(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: { 
      title: '¿Está seguro de eliminar la guía?',
      message: 'Esto también elimina los pasos y los archivos o imagenes que contenga'
    } as ConfirmData });
    dialogRef.afterClosed().pipe(take(1)).subscribe((c: ConfirmData) => {
      if (c.action === 'confirm') {
        this.service.deleteGuide(this.idGuide || 0).pipe(take(1)).subscribe(d => {
          this.router.navigate(['/dashboard/guides']);
        });
      }
    });
  }

  onNewStep(): void {
    let previous: string | undefined;
    if (this.listSteps.length) {
      previous = this.listSteps[this.listSteps.length - 1].transactionTxt;
    }
    const dialogRef = this.dialog.open(StepEditComponent, {
      data: { idGuide: this.idGuide, previousTransaction: previous } as StepDialog, disableClose: true }
    );
    dialogRef.afterClosed().pipe(take(1)).subscribe((d: StepDialog) => {
      if (d.result === 'ok') {
        this.getGuideSteps();
      }
    });
  }

  onEditStep(step: Step): void {
    const dialogRef = this.dialog.open(StepEditComponent, {
      data: { idGuide: this.idGuide, step: step } as StepDialog,
      disableClose: true
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((d: StepDialog) => {
      if (d.result === 'ok') {
        this.getGuideSteps();
      }
    });
  }

  onDeleteStep(step: Step): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { 
      data: new ConfirmData('¿Eliminar paso ' + ((step.position || 0) + 1) + '?', 'Esto eliminará también el archivo o imagen adjunta')
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((c: ConfirmData) => {
      if (c.action === 'confirm') {
        this.service.deleteGuideStep(step.idStep || 0).pipe(take(1)).subscribe(s => this.getGuideSteps());
      }
    });
  }

  onDrop(e: CdkDragDrop<Step>): void {
    moveItemInArray(this.listSteps, e.previousIndex, e.currentIndex);
    let count: number = 0;
    this.listSteps.forEach(s => {
      s.position = count;
      count++;
    });
  }

  changeOrderEdit(): void {
    if (this.orderSteps) {
      this.service.changeStepsPosition(this.listSteps).pipe(take(1)).subscribe(c => {
        this.orderSteps = false;
        this.getGuideSteps();
      });
    } else {
      this.orderSteps = true;
    }
  }

  onStepFileClick(step: Step, img: HTMLDivElement): void {
    if (!step.fileUrl) {
      return;
    }
    if (step.isImage) {
      const rect = img.getBoundingClientRect();
      const x = rect.left + (img.clientWidth / 2) - (this.doc.documentElement.clientWidth / 2);
      const y = rect.top + (img.clientHeight / 2) - (this.doc.documentElement.clientHeight / 2);
      this.photoService.showImage(x, y, step);
    } else {
      this.service.downloadStepFile(step.idStep || 0).pipe(take(1)).subscribe(d => {
        const fileUrl = step.fileUrl?.replace('\\', '/') || '';
        const idx: number = (fileUrl.lastIndexOf('/') || 0) + 1;
        const fileName: string = fileUrl.slice(idx) || '';
        this.createFileDownload(d, fileName);
      });
    }
  }

  private createFileDownload(blob: any, fileName: string): void {
    const el = this.doc.createElement('a');
    el.href = URL.createObjectURL(blob);
    el.setAttribute('download', fileName);
    el.style.display = 'none';
    this.doc.body.appendChild(el);
    el.click();
    URL.revokeObjectURL(el.href);
    this.doc.body.removeChild(el);
  }

  onGeneratePdf(): void {
    this.service.generateGuidePdf(this.idGuide || 0).pipe(take(1)).subscribe(g => {
      const fileName: string = this.guide.value.title + '.pdf';
      this.createFileDownload(g, fileName);
    });
  }

  copyContent(text: string | undefined): void {
    if (text) {
      this.clipboard.copy(text);
      this.snack.open('Copiado al portapapeles', '👍', undefined, 2500);
    }
  }

}
