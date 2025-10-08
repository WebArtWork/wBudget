export const budgettransactionFormComponents = {
	formId: 'budgettransaction',
	title: 'Transaction',
	components: [
		{
			name: 'Boolean',
			key: 'isDeposit',
			focused: true,
			fields: [
				{
					name: 'Label',
					value: 'Is this a deposit?'
				}
			]
		},

		{
			name: 'Number',
			key: 'amount',
			fields: [
				{
					name: 'Placeholder',
					value: 'Fill transaction amount...'
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
					value: 'Fill transaction name...'
				},
				{
					name: 'Label',
					value: 'Name'
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
					value: 'Select category for transaction'
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
		}
	]
};
