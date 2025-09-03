export const budgettransactionFormComponents = {
	formId: 'budgettransaction',
	title: 'Budgettransaction',
	components: [
		{
			name: 'Text',
			key: 'name',
			focused: true,
			fields: [
				{
					name: 'Placeholder',
					value: 'fill budgettransaction title'
				},
				{
					name: 'Label',
					value: 'Title'
				}
			]
		},

		{
			name: 'Number',
			key: 'amount',
			fields: [
				{
					name: 'Placeholder',
					value: 'Enter amount'
				},
				{
					name: 'Label',
					value: 'Amount'
				}
			]
		},
		{
			name: 'Select',
			key: 'type',
			focused: false,
			fields: [
				{
					name: 'Placeholder',
					value: 'Select type (e.g. Income, Expense)'
				},
				{
					name: 'Items',
					value: ['Income', 'Expense']
				}
			]
		},
		{
			name: 'Select',
			key: 'unitId',
			fields: [
				{
					name: 'Label',
					value: 'Category (Unit)'
				},
				{
					name: 'Options',
					value: []
				} // сюди підтягуємо список категорій з UnitModule
			]
		},
		{
			name: 'Date',
			key: 'date',
			fields: [
				{
					name: 'Label',
					value: 'Date'
				}
			]
		}
	]
};
