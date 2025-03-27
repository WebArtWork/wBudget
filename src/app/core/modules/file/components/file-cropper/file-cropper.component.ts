import { Component } from '@angular/core';
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';
import { ButtonModule } from 'src/app/core/modules/button/button.module';

@Component({
	selector: 'app-file-cropper',
	templateUrl: './file-cropper.component.html',
	styleUrl: './file-cropper.component.scss',
	imports: [ImageCropperModule, ButtonModule],
	standalone: true
})
export class FileCropperComponent {
	close: () => void;

	croppedDataUrl: string;

	dataUrl: string;

	width: number;

	height: number;

	uploadImage: (croppedDataUrl: string) => void;

	imageCropped(event: ImageCroppedEvent): void {
		this.croppedDataUrl = event.base64 as string;
	}
}
