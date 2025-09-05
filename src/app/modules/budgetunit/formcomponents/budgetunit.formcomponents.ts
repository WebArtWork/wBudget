export const budgetunitFormComponents = {
	formId: 'budgetunit',
	title: 'Budgetunit',
	components: [
		{
			name: 'Text',
			key: 'name',
			focused: true,
			fields: [
				{
					name: 'Placeholder',
					value: 'Enter a category name'
				},
				{
					name: 'Label',
					value: 'Title'
				}
			]
		},

		{
			name: 'Select',
			key: 'budget',
			focused: false,
			fields: [
				{
					name: 'Placeholder',
					value: 'Select budget '
				},
				{
					name: 'Items',
					value: ['1', '2']
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
		}
	]
};
