import { useState, useCallback } from "react";
import type { PixelModalButton } from "../components/shared/PixelModal";

interface ModalState {
  visible: boolean;
  title: string;
  message: string;
  buttons: PixelModalButton[];
}

export function usePixelModal() {
  const [state, setState] = useState<ModalState>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  const showModal = useCallback(
    (title: string, message: string, buttons?: PixelModalButton[]) => {
      setState({
        visible: true,
        title,
        message,
        buttons: buttons ?? [
          { text: "확인", variant: "primary", onPress: () => setState((s) => ({ ...s, visible: false })) },
        ],
      });
    },
    []
  );

  const hideModal = useCallback(() => {
    setState((s) => ({ ...s, visible: false }));
  }, []);

  return { modalState: state, showModal, hideModal };
}
