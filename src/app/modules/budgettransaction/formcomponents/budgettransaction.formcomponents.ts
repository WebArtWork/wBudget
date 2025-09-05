export const budgettransactionFormComponents = {
	formId: 'budgettransaction',
	title: 'Budgettransaction',
	components: [
		{
			name: 'Checkbox',
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
			key: 'budget',
			fields: [
				{ name: 'Label', value: 'Budget' },
				{ name: 'Options', value: [] }
			]
		}
	]
};
