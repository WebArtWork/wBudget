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
					value: 'Fill  title'
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
					value: 'Fill  amount'
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
					value: 'Fill  currency'
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
					value: 'Fill  description'
				},
				{
					name: 'Label',
					value: 'Description'
				}
			]
		}
	]
};
