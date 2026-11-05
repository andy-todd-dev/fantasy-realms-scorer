import { tva } from '@gluestack-ui/utils/nativewind-utils';
export const cardStyle = tva({
  base: `flex-col bg-card border border-border rounded-2xl`,
  variants: {
    size: {
      default: 'p-4 gap-6',
      sm: 'p-3 gap-3',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});
