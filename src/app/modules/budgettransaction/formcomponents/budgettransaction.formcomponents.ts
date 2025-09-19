export const budgettransactionFormComponents = {
	formId: 'budgettransaction',
	title: 'Budgettransaction',
	components: [
		{
			name: 'Boolean',
			key: 'isDeposit',
			focused: true,
			fields: [
				{
					name: 'Label',
					value: 'Deposit?'
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
			name: 'Text',
			key: 'note',
			fields: [
				{
					name: 'Placeholder',
					value: 'Enter note'
				},
				{
					name: 'Label',
					value: 'Note'
				}
			]
		},
		{
			name: 'Select',
			key: 'unitId',
			fields: [
				{
					name: 'Items',
					value: []
				},
				{
					name: 'Placeholder',
					value: 'Select unit'
				},
				{
					name: 'Label',
					value: 'Unit'
				},
				{
					name: 'Disabled',
					value: false
				}
			]
		},
		{
			name: 'Select',
			key: 'budget',
			fields: [
				{
					name: 'Items',
					value: []
				},
				{
					name: 'Placeholder',
					value: 'Select budget'
				},
				{
					name: 'Label',
					value: 'Budget'
				},
				{
					name: 'Disabled',
					value: false
				}
			]
		}
	]
};
