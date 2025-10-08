export const budgetFormComponents = {
	formId: 'budget',
	title: 'Budget',
	components: [
		{
			name: 'Text',
			key: 'name',
			focused: true,
			fields: [
				{
					name: 'Placeholder',
					value: 'Fill budget name...'
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
			focused: true,
			fields: [
				{
					name: 'Placeholder',
					value: 'Fill budget amount...'
				},
				{
					name: 'Label',
					value: 'Amount'
				}
			]
		},
		{
			name: 'Text',
			key: 'currency',
			focused: true,
			fields: [
				{
					name: 'Placeholder',
					value: 'Fill budget currency...'
				},
				{
					name: 'Label',
					value: 'Currency'
				}
			]
		},
		{
			name: 'Text',
			key: 'description',
			fields: [
				{
					name: 'Placeholder',
					value: 'Fill budget description...'
				},
				{
					name: 'Label',
					value: 'Description'
				}
			]
		}
	]
};
