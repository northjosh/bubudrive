import { useState, useCallback, useEffect, useRef } from "react";
import type { File, Folder } from "../../../../shared/types";

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuState {
  isVisible: boolean;
  position: ContextMenuPosition;
  data?: File | Folder;
}

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isVisible: false,
    position: { x: 0, y: 0 },
  });

  const menuRef = useRef<HTMLDivElement>(null);

  const showContextMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>, data?: File | Folder) => {
      event.preventDefault();
      event.stopPropagation();

      setContextMenu({
        isVisible: true,
        position: { x: event.clientX, y: event.clientY },
        data,
      });
    },
    []
  );

  const hideContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, isVisible: false }));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        hideContextMenu();
      }
    };

    const handleScroll = () => hideContextMenu();

    if (contextMenu.isVisible) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("scroll", handleScroll);
      document.addEventListener("contextmenu", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("scroll", handleScroll);
      document.removeEventListener("contextmenu", handleClickOutside);
    };
  }, [contextMenu.isVisible, hideContextMenu]);

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
    menuRef,
  };
};
