import {
	ComponentFactoryResolver,
	ApplicationRef,
	TemplateRef,
	Injectable,
	Injector,
	Type
} from '@angular/core';
import { CoreService, ModalService, StoreService, Modal } from 'wacom';
import {
	FormComponentInterface,
	TemplateFieldInterface
} from './interfaces/component.interface';
import { FormInterface } from './interfaces/form.interface';
import { ModalFormComponent } from './modals/modal-form/modal-form.component';
import { TranslateService } from '../translate/translate.service';
import { ModalUniqueComponent } from './modals/modal-unique/modal-unique.component';
import { environment } from 'src/environments/environment';
import { CustomformService } from 'src/app/modules/customform/services/customform.service';

export interface FormModalButton {
	click: (submition: unknown, close: () => void) => void;
	/** Label for the button */
	label: string;
	/** CSS class for the button (optional) */
	class?: string;
}

@Injectable({
	providedIn: 'root'
})
export class FormService {
	/** Application ID from the environment configuration */
	readonly appId = (environment as unknown as { appId: string }).appId;

	constructor(
		private componentFactoryResolver: ComponentFactoryResolver,
		private _translate: TranslateService,
		private _cfs: CustomformService,
		private appRef: ApplicationRef,
		private _modal: ModalService,
		private _store: StoreService,
		private _core: CoreService,
		private injector: Injector
	) {
		/** Load form IDs from the store */
		this._store.getJson('formIds', (formIds: string[]) => {
			if (Array.isArray(formIds)) {
				this.formIds.push(...formIds);
			}
		});
	}

	private _injectedComponent: Record<string, boolean> = {};
	templateFields: Record<string, string[]> = {};
	getTemplateFields(name: string): string[] {
		return this.templateFields[name] || ['Placeholder', 'Label'];
	}
	setTemplateFields(
		name: string,
		fields: string[],
		customFields: Record<string, string> = {}
	): void {
		this.templateFields[name] = fields;

		this.customTemplateFields[name] = {
			...(this.customTemplateFields[name] || {}),
			...customFields
		};
	}
	customTemplateFields: Record<string, Record<string, string>> = {};
	getCustomTemplateFields(name: string): Record<string, string> {
		return this.customTemplateFields[name] || {};
	}
	injectComponent<T>(
		name: string,
		component: Type<T>,
		fields = ['Placeholder', 'Label'],
		customFields: Record<string, string> = {}
	): void {
		if (!this._injectedComponent[name]) {
			this._injectedComponent[name] = true;

			this.templateFields[name] = fields;

			this.customTemplateFields[name] = customFields;

			const componentFactory =
				this.componentFactoryResolver.resolveComponentFactory(
					component
				);

			const componentRef = componentFactory.create(this.injector);

			this.appRef.attachView(componentRef.hostView);

			const domElem = (
				componentRef.hostView as unknown as { rootNodes: HTMLElement[] }
			).rootNodes[0];

			document.body.appendChild(domElem);
		}
	}
	private _templateComponent: Record<string, TemplateRef<unknown>> = {};
	addTemplateComponent<T>(name: string, template: TemplateRef<T>): void {
		if (!this._templateComponent[name]) {
			this._templateComponent[name] = template;
		}
	}
	getTemplateComponent(name: string): TemplateRef<unknown> | undefined {
		return this._templateComponent[name];
	}
	getTemplateComponentsNames(): string[] {
		const names = [];

		for (const name in this._templateComponent) {
			names.push(name);
		}

		return names;
	}

	/** Translates the form title and its components' fields */
	translateForm(form: FormInterface): void {
		if (form.title) {
			form.title = this._translate.translate(
				`Form_${form.formId}.${form.title}`,
				(title: string) => {
					form.title = title;
				}
			);

			for (const component of form.components) {
				for (const field of component.fields || []) {
					this.translateFormComponent(form, field);
				}
			}
		}
	}
	/** Translates individual form components' fields */
	translateFormComponent(
		form: FormInterface,
		field: TemplateFieldInterface
	): void {
		const fieldValue = field.value;

		if (typeof fieldValue === 'string' && !field.skipTranslation) {
			field.value = this._translate.translate(
				`Form_${form.formId}.${fieldValue}`,
				(value: string) => {
					field.value = value;
				}
			);
		}
	}

	/** List of forms managed by the service */
	forms: FormInterface[] = [];

	/** List of form IDs managed by the service */
	formIds: string[] = [];

	/** Creates a default form with specified components */
	getDefaultForm(
		id: string,
		components = ['name', 'description']
	): FormInterface {
		if (this.formIds.indexOf(id) === -1) {
			this.formIds.push(id);

			this._store.setJson('formIds', this.formIds);
		}

		const form = {
			id,
			components: components.map((key, index) => {
				const name = key.includes('.') ? key.split('.')[1] : 'Text';

				return {
					name,
					key,
					focused: !index,
					fields: [
						{
							name: 'Placeholder',
							value: 'Enter your ' + key.split('.')[0]
						},
						{
							name: 'Label',
							value: key.split('.')[0].capitalize()
						}
					]
				};
			})
		};

		return form;
	}

	/** Prepare form component */
	prepareForm(form: FormInterface): FormInterface {
		const formId = form.formId + '';

		if (this.formIds.indexOf(formId) === -1) {
			this.formIds.push(formId);

			this._store.setJson('formIds', this.formIds);
		}

		form = form || this.getDefaultForm(formId);

		form.formId = formId;

		this._core.onComplete('form_loaded').then(() => {
			const customForms = this._cfs.customforms.filter(
				(f) => f.active && f.formId === form.formId
			);

			for (const customForm of customForms) {
				form.title = form.title || customForm.name;

				form.class = form.class || customForm.class;

				for (const component of customForm.components) {
					component.key = component.key?.startsWith('data.')
						? component.key
						: 'data.' + component.key;

					form.components.push(component);
				}
			}

			this.translateForm(form);
		});

		return form;
	}
	getForm(formId: string, form?: FormInterface): FormInterface {
		console.warn('This function is deprecated');

		if (
			form &&
			this.forms.map((c) => c.formId).indexOf(form?.formId) === -1
		) {
			this.forms.push(form);
		}

		if (this.formIds.indexOf(formId) === -1) {
			this.formIds.push(formId);

			this._store.setJson('formIds', this.formIds);
		}

		form = form || this.forms.find((f) => f.formId === formId);

		form = form || this.getDefaultForm(formId);

		form.formId = formId;

		this._core.onComplete('form_loaded').then(() => {
			const customForms = this._cfs.customforms.filter(
				(f) => f.active && f.formId === form.formId
			);

			for (const customForm of customForms) {
				form.title = form.title || customForm.name;

				form.class = form.class || customForm.class;

				for (const component of customForm.components) {
					component.key = component.key?.startsWith('data.')
						? component.key
						: 'data.' + component.key;

					form.components.push(component);
				}
			}

			this.translateForm(form);
		});

		return form;
	}

	/** Shows a modal form with specified options */
	modal<T>(
		form: FormInterface | FormInterface[],
		buttons: FormModalButton | FormModalButton[] = [],
		submition: unknown = { data: {} },
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		change: (update: T) => void | Promise<(update: T) => void> = (
			update: T
		): void => {},
		modalOptions: Modal = {}
	): Promise<T> {
		return new Promise((resolve) => {
			this._modal.show({
				...modalOptions,
				component: ModalFormComponent,
				class: 'forms_modal',
				size: 'big',
				form,
				buttons: Array.isArray(buttons) ? buttons : [buttons],
				submition,
				onClose: function () {
					resolve(this.submition as T);
				},
				submit: (update: T) => {
					resolve(update);
				},
				change: (update: T) => {
					if (typeof change === 'function') {
						change(update);
					}
				}
			});
		});
	}

	/** Shows a modal form with docs in ace editor */
	modalDocs<T>(docs: T[]): Promise<T[]> {
		return new Promise((resolve) => {
			const submition = {
				docs: JSON.stringify(docs.length ? docs : [], null, 4)
			};

			this._modal.show({
				component: ModalFormComponent,
				class: 'forms_modal',
				size: 'big',
				submition,
				form: {
					title: 'Modify content of documents',
					components: [
						{
							name: 'Code',
							key: 'docs',
							fields: [
								{
									name: 'Placeholder',
									value: 'fill content of documents'
								}
							]
						}
					]
				},
				onClose: function () {
					const docs: T[] = submition.docs
						? JSON.parse(submition.docs)
						: [];

					resolve(docs);
				},
				submit: () => {
					const docs: T[] = submition.docs
						? JSON.parse(submition.docs)
						: [];

					resolve(docs);
				}
			});
		});
	}

	/** Shows a modal with a unique component */
	modalUnique<T>(
		module: string,
		field: string,
		doc: T,
		component: string = '',
		onClose: () => void | Promise<() => void> = (): void => {}
	): void {
		this._modal.show({
			component: ModalUniqueComponent,
			form: this.getDefaultForm('unique', [
				field + (component ? '.' + component : '')
			]),
			module,
			field,
			doc,
			class: 'forms_modal',
			onClose
		});
	}

	getComponent(form: FormInterface, key: string): FormComponentInterface {
		return (
			this._getComponent(form.components, key) ||
			({} as FormComponentInterface)
		);
	}

	getField(
		form: FormInterface,
		key: string,
		name: string
	): TemplateFieldInterface | null {
		const component = this.getComponent(form, key);

		if (!component) {
			return null;
		}

		for (const field of component?.fields || []) {
			if (field.name === name) {
				return field;
			}
		}

		return null;
	}

	setValue(
		form: FormInterface,
		key: string,
		name: string,
		value: unknown
	): void {
		const field = this.getField(form, key, name);

		if (field) {
			field.value = value;

			const component = this.getComponent(form, key);

			component?.resetFields?.();
		}
	}

	private _getComponent(
		components: FormComponentInterface[],
		key: string
	): FormComponentInterface | null {
		for (const component of components) {
			if (component.key === key) {
				return component;
			} else if (component.components) {
				const comp = this._getComponent(component.components, key);

				if (comp) {
					return comp;
				}
			}
		}

		return null;
	}

	private _addCustomComponents(form: FormInterface) {}
}
