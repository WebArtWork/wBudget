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
			name: 'Number',
			key: 'cost',
			focused: true,
			fields: [
				{
					name: 'Placeholder',
					value: 'Enter a cost'
				},
				{
					name: 'Label',
					value: 'Cost'
				}
			]
		}
	]
};
