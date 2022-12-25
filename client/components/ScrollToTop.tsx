import { IconArrowUp } from '@tabler/icons';
import { useWindowScroll } from '@mantine/hooks';
import { ActionIcon, Affix, Button, Text, Transition } from '@mantine/core';

export default function ScrollToTop() {
    const [scroll, scrollTo] = useWindowScroll();

    return (
        <>
            <Affix position={{ bottom: 20, right: 20 }}>
                <Transition transition="slide-up" mounted={scroll.y > 0}>
                    {(transitionStyles) => (
                        <ActionIcon sx={{ backgroundColor: "#cfe9e1"}} variant="filled" style={transitionStyles} onClick={() => scrollTo({ y: 0 })}><IconArrowUp size={16} /></ActionIcon>
                    )}
                </Transition>
            </Affix>
        </>
    );
}
