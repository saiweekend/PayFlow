import type { Meta, StoryObj } from '@storybook/vue3';
import TransactionListItem from '../components/TransactionListItem.vue';

const meta: Meta<typeof TransactionListItem> = {
  title: 'Payments/TransactionListItem',
  component: TransactionListItem,
  args: {
    currentUserId: 'usr_1',
  },
};

export default meta;
type Story = StoryObj<typeof TransactionListItem>;

export const Outgoing: Story = {
  args: {
    transaction: {
      id: 'tx_1',
      senderId: 'usr_1',
      recipientId: 'usr_2',
      amountMinor: 3000,
      currency: 'JPY',
      memo: 'Lunch',
      status: 'completed',
      createdAt: new Date().toISOString(),
    },
  },
};

export const Incoming: Story = {
  args: {
    transaction: {
      id: 'tx_2',
      senderId: 'usr_2',
      recipientId: 'usr_1',
      amountMinor: 12000,
      currency: 'JPY',
      status: 'completed',
      createdAt: new Date().toISOString(),
    },
  },
};
