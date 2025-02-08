export const budgettransactionFormComponents = {
	formId: 'budgettransaction',
	title: 'Budgettransaction',
	components: [
		{
			name: 'Text',
			key: 'note',
			focused: true,
			fields: [
				{
					name: 'Placeholder',
					value: 'fill note'
				},
				{
					name: 'Label',
					value: 'Note'
				}
			]
		},
		{
			name: 'Number',
			key: 'amount',
			fields: [
				{
					name: 'Placeholder',
					value: 'fill amount'
				},
				{
					name: 'Label',
					value: 'Amount'
				}
			]
		},
		{
			name: 'Boolean',
			key: 'isDeposit',
			fields: [
				{
					name: 'Label',
					value: 'Deposit'
				}
			]
		}
	]
};
