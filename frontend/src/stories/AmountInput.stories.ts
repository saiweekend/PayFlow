import type { Meta, StoryObj } from '@storybook/vue3';
import AmountInput from '../components/AmountInput.vue';

const meta: Meta<typeof AmountInput> = {
  title: 'Payments/AmountInput',
  component: AmountInput,
  args: {
    modelValue: null,
  },
};

export default meta;
type Story = StoryObj<typeof AmountInput>;

export const Empty: Story = {};

export const WithValue: Story = {
  args: { modelValue: 2500 },
};

export const WithError: Story = {
  args: { modelValue: 999_999_999, error: 'Amount exceeds the per-transfer limit.' },
};
