import { createContext, useContext, useState, useCallback } from "react";
import {
  setEventIconOverride as _set,
  clearEventIconOverride as _clear,
  getEventIcon as _get,
} from "../utils/eventIcons";

const IconContext = createContext(null);

export function IconProvider({ children }) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const applyOverride = useCallback((eventId, iconKey) => { _set(eventId, iconKey); bump(); }, [bump]);
  const removeOverride = useCallback((eventId) => { _clear(eventId); bump(); }, [bump]);

  return (
    <IconContext.Provider value={{ version, applyOverride, removeOverride }}>
      {children}
    </IconContext.Provider>
  );
}

export function useIconVersion() {
  const ctx = useContext(IconContext);
  if (!ctx) throw new Error("useIconVersion must be used inside <IconProvider>");
  return ctx.version;
}

export function useIconActions() {
  const ctx = useContext(IconContext);
  if (!ctx) throw new Error("useIconActions must be used inside <IconProvider>");
  return { applyOverride: ctx.applyOverride, removeOverride: ctx.removeOverride };
}

export function useEventIcon(event) {
  useIconVersion(); 
  return _get(event);
}