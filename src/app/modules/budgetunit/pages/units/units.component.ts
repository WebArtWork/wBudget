import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormService } from 'src/app/core/modules/form/form.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { TableModule } from 'src/app/core/modules/table/table.module';
import { TranslateService } from 'src/app/core/modules/translate/translate.service';
import { CrudComponent } from 'wacom';
import { budgetunitFormComponents } from '../../formcomponents/budgetunit.formcomponents';
import { Budgetunit } from '../../interfaces/budgetunit.interface';
import { BudgetunitService } from '../../services/budgetunit.service';

@Component({
	imports: [CommonModule, TableModule],
	templateUrl: './units.component.html',
	styleUrls: ['./units.component.scss']
})
export class UnitsComponent extends CrudComponent<
	BudgetunitService,
	Budgetunit,
	FormInterface
> {
	override configType: 'local' | 'server' = 'local';
	columns = ['name', 'cost'];
	config = this.getConfig();
	budget = this._router.url.replace('/units/', '');

	override allowUrl(): boolean {
		return false;
	}

	constructor(
		private _budgetunitService: BudgetunitService,
		private _translate: TranslateService,
		private _form: FormService,
		private _router: Router
	) {
		super(
			budgetunitFormComponents,
			_form,
			_translate,
			_budgetunitService,
			'Budgetunit'
		);

		this.config.buttons.unshift({
			icon: 'add',
			click: () => this.createUnit()
		});

		this.config.buttons.push({
			icon: 'edit',
			click: (doc: Budgetunit) => this.editUnit(doc)
		});

		this.config.buttons.push({
			icon: 'delete',
			click: (doc: Budgetunit) => this.deleteUnit(doc)
		});

		this._budgetunitService
			.get({ query: 'budget=' + this.budget })
			.subscribe({
				next: () => this.setDocuments()
			});
	}

	handleButtonClick(btn: any, unit?: Budgetunit) {
		if (btn.click && unit !== undefined) {
			btn.click(unit);
		} else if (btn.click) {
			btn.click();
		}
	}

	createUnit() {
		const formComponents = JSON.parse(
			JSON.stringify(budgetunitFormComponents)
		);
		(this.formService as FormService).modal<Budgetunit>(formComponents, [
			{
				label: 'Create',
				click: (submitted: unknown, close: () => void) => {
					const created = submitted as Budgetunit;
					created.budget = this.budget;

					this.service.create(created).subscribe({
						next: () => {
							this.setDocuments();
							close();
						},
						error: (err) =>
							console.error('Error creating unit:', err)
					});
				}
			}
		]);
	}

	editUnit(unit: Budgetunit) {
		if (!unit._id) return;

		const formComponents = JSON.parse(
			JSON.stringify(budgetunitFormComponents)
		);
		formComponents.components.forEach((comp: any) => {
			if (!comp.key) return;
			const value = (unit as any)[comp.key];
			comp.value = value !== undefined ? value : '';
		});

		(this.formService as FormService).modal<Budgetunit>(formComponents, [
			{
				label: 'Save',
				click: (submitted: unknown, close: () => void) => {
					const updated = submitted as Budgetunit;
					updated._id = unit._id;

					this.service.update(updated).subscribe({
						next: () => {
							this.setDocuments();
							close();
						},
						error: (err) =>
							console.error('Error updating unit:', err)
					});
				}
			}
		]);
	}

	deleteUnit(unit: Budgetunit) {
		if (!unit._id) return;
		if (confirm(`Delete unit "${unit.name}"?`)) {
			this.service.delete(unit).subscribe(() => {
				this.documents = this.documents.filter(
					(u) => u._id !== unit._id
				);
			});
		}
	}
}
