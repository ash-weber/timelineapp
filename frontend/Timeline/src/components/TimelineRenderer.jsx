import TimelineCard from "./TimelineCard";
import YearDot from "./YearDot";
import { getEventIcon } from "../utils/eventIcons";

export default function TimelineRenderer({
  events,
  zoom,
  view,
  dark,
  yearGroups,
  onSelectEvent,
  onSelectYear,
}) {
  if (zoom === "year") {
    const years = Object.keys(yearGroups).sort((a, b) => a - b);

    if (view === "horizontal") {
      return (
        <div
          style={{
            display: "flex",
            gap: 60,
            minWidth: "max-content",
            padding: "30px 10px",
            alignItems: "center",
          }}
        >
          {years.map((year, i) => (
            <div
              key={year}
              style={{ display: "flex", alignItems: "center", gap: 60 }}
            >
              <YearDot
                year={year}
                count={yearGroups[year].length}
                dark={dark}
                onClick={() =>
                  onSelectYear({ year, events: yearGroups[year] })
                }
              />
              {i !== years.length - 1 && (
                <div
                  style={{
                    minWidth: 60,
                    height: 4,
                    background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                    borderRadius: 10,
                    opacity: 0.3,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
          paddingLeft: 20,
        }}
      >
        {years.map((year, i) => (
          <div
            key={year}
            style={{ display: "flex", gap: 35, alignItems: "flex-start" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ marginTop: 4 }}>
                <YearDot
                  year={year}
                  count={yearGroups[year].length}
                  dark={dark}
                  onClick={() =>
                    onSelectYear({ year, events: yearGroups[year] })
                  }
                />
              </div>
              {i !== years.length - 1 && (
                <div
                  style={{
                    width: 4,
                    height: 60,
                    background: "linear-gradient(#2563eb22, transparent)",
                    marginTop: 8,
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (view === "horizontal") {
    return (
      <div
        style={{
          display: "flex",
          gap: 40,
          minWidth: "max-content",
          padding: "20px 10px",
        }}
      >
        {events.map((ev, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 40 }}
          >
            <TimelineCard
              event={ev}
              zoom={zoom}
              dark={dark}
              onClick={() => onSelectEvent(ev)}
            />
            {i !== events.length - 1 && (
              <div
                style={{
                  minWidth: 60,
                  height: 4,
                  background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                  borderRadius: 10,
                  opacity: 0.3,
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        paddingLeft: 20,
      }}
    >
      {events.map((ev, i) => {
        const { Icon, color } = getEventIcon(ev);
        return (
          <div key={i} style={{ display: "flex", gap: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `${color}18`,
                border: `2px solid ${color}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 0 0 4px ${color}11`,
              }}>
                <Icon size={17} color={color} />
              </div>
              {i !== events.length - 1 && (
                <div style={{ width: 2, flex: 1, background: `linear-gradient(${color}44, transparent)`, marginTop: 4 }} />
              )}
            </div>
            <div style={{ paddingBottom: 48, flex: 1 }}>
              <TimelineCard event={ev} zoom={zoom} dark={dark} onClick={() => onSelectEvent(ev)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}