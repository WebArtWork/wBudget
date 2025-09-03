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
					value: 'fill budget title',
				},
				{
					name: 'Label',
					value: 'Title',
				}
			]
		},
		{
			name: 'Text',
			key: 'description',
			fields: [
				{
					name: 'Placeholder',
					value: 'fill budget description',
				},
				{
					name: 'Label',
					value: 'Description',
				}
			]
		}
	]
}
