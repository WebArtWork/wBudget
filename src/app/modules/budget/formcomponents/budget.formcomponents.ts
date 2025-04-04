export const budgetFormComponents = {
	formId: 'budget',
	title: 'Budget',
	components: [
		{
			name: 'Photo',
			key: 'thumb',
			fields: [
				{
					name: 'Label',
					value: 'Photo'
				}
			]
		},
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
			name: 'Text',
			key: 'currency',
			focused: true,
			fields: [
				{
					name: 'Placeholder',
					value: 'fill currency'
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
