import React from 'react';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Platform, View } from 'react-native';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { useTheme } from '@/contexts/ThemeContext';

const dividerStyle = tva({
  base: '',
  variants: {
    orientation: {
      vertical: 'w-px h-full bg-[#cbd5e1] dark:bg-[#475569] mx-1',
      horizontal: 'h-px w-full bg-[#cbd5e1] dark:bg-[#475569] my-1',
    },
  },
});

type IUIDividerProps = React.ComponentPropsWithoutRef<typeof View> &
  VariantProps<typeof dividerStyle>;

const Divider = React.forwardRef<
  React.ElementRef<typeof View>,
  IUIDividerProps
>(({ className, orientation = 'horizontal', ...props }, ref) => {
    const {pallatte} = useTheme();
  return (
    <View
      ref={ref}
      {...props}
      aria-orientation={orientation}
      role={Platform.OS === 'web' ? 'separator' : undefined}
      className={dividerStyle({
        orientation,
        class: className,
      })}
      // style={{backgroundColor : pallatte.tint}}
    />
  );
});

Divider.displayName = 'Divider';

export { Divider };

 