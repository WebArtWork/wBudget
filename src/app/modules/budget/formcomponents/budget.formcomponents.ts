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
					value: 'fill budget title'
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
					value: 'fill budget amount'
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
					value: 'fill budget currency'
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
					value: 'fill budget description'
				},
				{
					name: 'Label',
					value: 'Description'
				}
			]
		}
	]
};
