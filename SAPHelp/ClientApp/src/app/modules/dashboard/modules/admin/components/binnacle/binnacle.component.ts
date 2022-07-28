import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Binnacle } from 'src/app/entities/user';

@Component({
  selector: 'cjf-binnacle',
  templateUrl: './binnacle.component.html',
  styleUrls: ['./binnacle.component.scss']
})
export class BinnacleComponent implements OnInit {
  pageSizeOptions: number[] = [25,50,100];
  pageSize: number = this.pageSizeOptions[0];
  startIndex: number = 0;
  endIndex: number = this.pageSize;
  search = new FormControl(null);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: BinnacleData
  ) { }

  ngOnInit(): void {
  }

  onPageChange(e: PageEvent): void {
    this.startIndex = e.pageIndex * e.pageSize;
    this.endIndex = this.startIndex + e.pageSize;
  }

}

export class BinnacleData {
  name!: string;
  binnacle: Binnacle[] = [];
}