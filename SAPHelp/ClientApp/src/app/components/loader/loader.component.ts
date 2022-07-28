import { AfterViewInit, Component, OnInit } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { fadeLoader } from 'src/app/animations';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'cjf-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  animations: [fadeLoader]
})
export class LoaderComponent implements OnInit, AfterViewInit {
  show: Observable<boolean> = EMPTY;

  constructor(private service: LoaderService) { }

  ngAfterViewInit(): void {
    this.show = this.service.show.pipe(delay(0));
  }

  ngOnInit(): void {
  }

}
