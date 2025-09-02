import {
	SimpleChanges,
	EventEmitter,
	Component,
	OnChanges,
	Output,
	Input,
} from '@angular/core';
import { SelectModule } from 'src/app/core/modules/select/select.module';
import { FileService } from '../../services/file.service';
import { File } from '../../interfaces/file.interface';

@Component({
	selector: 'file-selector',
	templateUrl: './file-selector.component.html',
	styleUrls: ['./file-selector.component.scss'],
	imports: [SelectModule],
})
export class FileSelectorComponent implements OnChanges {
	@Input() value: string;

	@Output() wChange = new EventEmitter();

	get items(): File[] {
		return this._fileService.files;
	}

	constructor(private _fileService: FileService) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['value'] && !changes['value'].firstChange) {
			this.value = changes['value'].currentValue;
		}
	}
}
