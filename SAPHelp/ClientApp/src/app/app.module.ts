import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import localeMx from '@angular/common/locales/es-MX';
import { registerLocaleData } from "@angular/common";
registerLocaleData(localeMx);

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CustomInterceptor } from './interceptors/custom.interceptor';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { LoaderComponent } from './components/loader/loader.component';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorIntService } from './services/paginator-int.service';

@NgModule({
  declarations: [
    AppComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    HttpClientModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-MX' },
    { provide: HTTP_INTERCEPTORS, useClass: CustomInterceptor, multi: true },
    { provide: MatPaginatorIntl, useClass: PaginatorIntService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
