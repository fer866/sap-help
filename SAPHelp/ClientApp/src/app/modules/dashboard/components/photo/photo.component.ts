import { Component, HostListener, OnInit } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { filter, map, shareReplay, take } from 'rxjs/operators';
import { photo } from 'src/app/animations';
import { PhotoProps, Step } from 'src/app/entities/guide';
import { PhotoService } from 'src/app/services/photo.service';

@Component({
  selector: 'cjf-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.scss'],
  animations: [photo]
})
export class PhotoComponent implements OnInit {
  props: Observable<PhotoProps> = EMPTY;
  step: Observable<Step> = EMPTY;

  constructor(private service: PhotoService) { }

  @HostListener('document:keydown.escape', ['$event']) onEscapeHandler(e: KeyboardEvent) {
    this.service.show.pipe(take(1), filter(s => s)).subscribe(_ => this.service.hideImage());
  }

  ngOnInit(): void {
    this.props = this.service.props.pipe(take(1), shareReplay(1));
    this.step = this.service.props.pipe(take(1), map(p => p.step || {}), shareReplay(1));
  }

  onClose(): void {
    this.service.hideImage();
  }

}
