import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AmountInput from '@/components/AmountInput.vue';

describe('AmountInput', () => {
  it('emits a parsed number as the user types', async () => {
    const wrapper = mount(AmountInput, { props: { modelValue: null } });
    const input = wrapper.find('input');

    await input.setValue('2500');

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2500]);
  });

  it('emits null for invalid input instead of NaN', async () => {
    const wrapper = mount(AmountInput, { props: { modelValue: null } });
    const input = wrapper.find('input');

    await input.setValue('not-a-number');

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null]);
  });

  it('shows the error message and marks the field aria-invalid when error is set', () => {
    const wrapper = mount(AmountInput, {
      props: { modelValue: null, error: 'Insufficient balance.' },
    });

    expect(wrapper.text()).toContain('Insufficient balance.');
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
  });

  it('shows a formatted preview when there is no error', async () => {
    const wrapper = mount(AmountInput, { props: { modelValue: null } });
    await wrapper.find('input').setValue('1000');

    expect(wrapper.text()).toContain('¥1,000');
  });
});
