import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormService } from 'src/app/core/modules/form/form.service';
import { FormInterface } from 'src/app/core/modules/form/interfaces/form.interface';
import { TableModule } from 'src/app/core/modules/table/table.module';
import { TranslateService } from 'src/app/core/modules/translate/translate.service';
import { CrudComponent } from 'wacom';
import { budgetFormComponents } from '../../formcomponents/budget.formcomponents';
import { Budget } from '../../interfaces/budget.interface';
import { BudgetService } from '../../services/budget.service';
import { Router } from '@angular/router';

@Component({
	imports: [CommonModule, TableModule],
	templateUrl: './budgets.component.html',
	styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent extends CrudComponent<
	BudgetService,
	Budget,
	FormInterface
> {
	budgets: Budget[] = [];
	override configType: 'local' | 'server' = 'local';
	columns = ['name', 'description', 'amount', 'currency'];
	config = this.getConfig();

	override allowUrl(): boolean {
		return false;
	}

	constructor(
		_budgetService: BudgetService,
		_translate: TranslateService,
		_form: FormService,
		public router: Router
	) {
		super(
			budgetFormComponents,
			_form,
			_translate,
			_budgetService,
			'Budget'
		);

		this.config.buttons.unshift({
			icon: 'add',
			click: () => this.createBudget()
		});

		this.config.buttons.push({
			icon: 'category',
			hrefFunc: (doc: Budget) =>
				doc._id ? '/units/' + doc._id : '/units'
		});

		this.config.buttons.push({
			icon: 'edit',
			click: (doc: Budget) => this.editBudget(doc)
		});

		this.config.buttons.push({
			icon: 'delete',
			click: (doc: Budget) => this.deleteBudget(doc)
		});

		this.setDocuments();
	}

	handleButtonClick(btn: any, budget?: Budget) {
		if (btn.hrefFunc) {
			const url = budget ? btn.hrefFunc(budget) : btn.hrefFunc();
			this.router.navigateByUrl(url);
		} else if (btn.click && budget !== undefined) {
			btn.click(budget);
		} else if (btn.click) {
			btn.click();
		}
	}

	createBudget() {
		const formComponents = JSON.parse(JSON.stringify(budgetFormComponents));
		(this.formService as FormService).modal<Budget>(formComponents, [
			{
				label: 'Create',
				click: (submitted: unknown, close: () => void) => {
					const created = submitted as Budget;
					this.service.create(created).subscribe({
						next: () => {
							this.setDocuments();
							close();
						},
						error: (err) =>
							console.error('Error creating budget:', err)
					});
				}
			}
		]);
	}

	editBudget(budget: Budget) {
		if (!budget._id) return;

		const formComponents = JSON.parse(JSON.stringify(budgetFormComponents));

		formComponents.components.forEach((comp: any) => {
			if (!comp.key) return;
			const budgetValue = (budget as any)[comp.key];
			comp.value =
				budgetValue !== undefined && budgetValue !== null
					? budgetValue
					: '';
		});

		(this.formService as FormService).modal<Budget>(formComponents, [
			{
				label: 'Save',
				click: (submitted: unknown, close: () => void) => {
					const updated = submitted as Budget;
					updated._id = budget._id;
					this.service.update(updated).subscribe({
						next: () => {
							this.setDocuments();
							close();
						},
						error: (err) =>
							console.error('Error updating budget:', err)
					});
				}
			}
		]);
	}

	deleteBudget(budget: Budget) {
		if (!budget._id) return;
		if (confirm(`Delete budget "${budget.name}"?`)) {
			this.service.delete(budget).subscribe(() => {
				this.documents = this.documents.filter(
					(b) => b._id !== budget._id
				);
			});
		}
	}

	goToDashboard(budgetId: string) {
		this.router.navigate(['/dashboard'], {
			queryParams: { budget: budgetId }
		});
	}
}
