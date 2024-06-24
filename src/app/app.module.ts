// import module
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppComponent } from './app.component';
import { ItemDetailComponent } from '../ctm-viewer/plugins/shopitem-viewer/item-detail/item-detail.component';
import { MuseumItemDetailComponent } from '../ctm-viewer/plugins/museum-item-viewer/museum-item-detail/museum-item-detail.component';
// import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';  // 导入 MatCardModule
import { MatIconModule } from '@angular/material/icon';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';

// import { RouterOutlet } from '@angular/router';

@NgModule({
    declarations: [
        AppComponent,
        ItemDetailComponent,
        MuseumItemDetailComponent
    ],
    imports: [
        BrowserModule,
        MatButtonModule,
        MatTooltipModule,
        MatDialogModule,
        // NgbCarouselModule,
        MatCardModule,
        MatIconModule,
        NgbCollapseModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }