import {css} from 'emotion';
import {Temporal} from 'proposal-temporal';
import React, {useEffect, useState} from 'react';
import {
  FaAngleLeft as LeftIcon,
  FaAngleRight as RightIcon,
  FaCompress as CompressIcon,
  FaExpand as ExpandIcon,
} from 'react-icons/fa';
import {CALENDAR_DATA} from './CalendarData';
import createSilentAudio from './createSilentAudio';

const START_TIME = Temporal.Time.from({hour: 8, minute: 30});
const END_TIME = Temporal.Time.from({hour: 14, minute: 30});
const LABEL_STEP = Temporal.Duration.from({minutes: 30});

const SMALL_SCREEN = '(max-width: 400px)';

const CALENDARS = CALENDAR_DATA.map(cal => ({
  ...cal,
  eventsByDay: cal.eventsByDay.map((events, dayIndex) =>
    events.map((ev, i) => {
      const end = ev.end ?? events[i + 1]?.start;
      if (!end) {
        throw new Error(
          `Missing end time for last event "${ev.title}" on day ${dayIndex} in "${cal.name}"`,
        );
      }

      const lower = ev.title.toLowerCase();
      let color = ev.color;
      let opacity = 1;
      if (['break', 'lunch'].includes(lower)) {
        color = '#999';
        opacity = 0.6;
      }
      if (
        ['independent', 'seesaw', 'office'].some(term => lower.includes(term))
      ) {
        opacity = 0.6;
      }
      return {
        ...ev,
        color,
        opacity,
        start: Temporal.Time.from(ev.start),
        end: Temporal.Time.from(end),
      };
    }),
  ),
}));

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: 'numeric',
  timeZone: Temporal.now.timeZone(),
});

function App() {
  const [currentDateTime, setCurrentDateTime] = useState(
    Temporal.now.dateTime(),
  );
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentDateTime(previous => {
        // Only increment the time if we are on the current day
        const newDateTime = Temporal.now.dateTime();
        if (previous.toDate().equals(newDateTime.toDate())) {
          return newDateTime;
        }
        return previous;
      });
    }, 1000 * 10);
    return () => clearInterval(id);
  }, []);

  const rows = [];
  let current = START_TIME;
  while (Temporal.Time.compare(current, END_TIME) <= 0) {
    rows.push(current);
    current = current.plus(LABEL_STEP);
  }

  return (
    <div
      className={css`
        background: white;
        display: grid;
        height: 100vh;
        max-height: -webkit-fill-available;
        padding: 12px 20px 20px 200px;
        width: 100vw;
        grid-template-columns: auto;
        grid-template-rows: auto;
        grid-auto-rows: minmax(0, 1fr);
        grid-auto-columns: minmax(0, 1fr);

        @media ${SMALL_SCREEN} {
          padding: 40px 10px 10px 10px;
        }
      `}>
      {rows.map((t, i) => (
        <TimeRow key={`label-${t.toString()}`} time={t} />
      ))}

      {CALENDARS.map((cal, calIndex) => (
        <CalendarHeader
          calendar={cal}
          index={calIndex}
          key={`calendar-${calIndex}-label`}
        />
      ))}

      {CALENDARS.map((cal, calIndex) =>
        (
          cal.eventsByDay[currentDateTime.dayOfWeek - 1] ?? []
        ).map((ev, evIndex) => (
          <CalendarEvent
            calendar={cal}
            calendarIndex={calIndex}
            event={ev}
            key={`calendar-${calIndex}_event-${evIndex}`}
          />
        )),
      )}

      <DatePicker
        currentDateTime={currentDateTime}
        setCurrentDateTime={setCurrentDateTime}
      />

      <CurrentTimeIndicator currentDateTime={currentDateTime} />

      <FullscreenButton />
    </div>
  );
}

function TimeRow({time}) {
  return (
    <>
      <div
        className={css`
          color: #666;
          font-size: 18px;
          padding-right: 8px;
          text-align: right;
          transform: translateY(-6px);

          @media ${SMALL_SCREEN} {
            font-size: 10px;
            width: 30px;
          }
        `}
        style={{
          gridColumn: 1,
          gridRow: toGridRow(time),
        }}>
        {timeFormatter.format(time)}
      </div>
      <div
        className={css`
          border-top: solid 1px #ccc;
        `}
        style={{
          gridColumnStart: 2,
          gridColumnEnd: CALENDARS.length + 2,
          gridRow: toGridRow(time),
        }}
      />
    </>
  );
}

function CalendarEvent({event, calendar, calendarIndex}) {
  const background = event.color || calendar.color || 'rgb(63, 81, 181)';
  const gridRowStart = toGridRow(event.start);
  const gridRowEnd = toGridRow(event.end);
  return (
    <div
      className={css`
        border-radius: 4px;
        color: white;
        font-size: ${gridRowEnd - gridRowStart > 3 ? 44 : 24}px;
        line-height: 100%;
        margin-bottom: 2px;
        margin-left: 8px;
        padding: 4px;

        @media ${SMALL_SCREEN} {
          font-size: 16px;
        }
      `}
      onClick={() => {
        if ('speechSynthesis' in window) {
          const msg = new SpeechSynthesisUtterance();
          msg.text = event.title;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(msg);
        }
      }}
      style={{
        background,
        gridColumn: calendarIndex + 2,
        gridRowStart,
        gridRowEnd,
        opacity: event.opacity,
      }}>
      {event.title}
    </div>
  );
}

function CalendarHeader({index, calendar}) {
  return (
    <h1
      className={css`
        font-size: 32px;
        margin: 0 0 8px 8px;
        text-align: center;

        @media ${SMALL_SCREEN} {
          font-size: 20px;
          margin: 0 0 0 8px;
        }
      `}
      style={{
        gridColumn: index + 2,
        gridRow: 1,
      }}>
      {calendar.name}
    </h1>
  );
}

const dayOfWeekFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  timeZone: Temporal.now.timeZone(),
});
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'numeric',
  day: 'numeric',
  timeZone: Temporal.now.timeZone(),
});

function DatePicker({currentDateTime, setCurrentDateTime}) {
  const isSmall = window.matchMedia(SMALL_SCREEN).matches;

  const buttonStyle = css`
    border: none;
    background: none;
    color: inherit;
    cursor: pointer;
    font-size: 32px;
    line-height: 20px;
    padding: 4px;
  `;

  return (
    <div
      className={css`
        align-items: center;
        color: #666;
        display: flex;
        font-size: 20px;
        position: fixed;
        left: 8px;
        top: 8px;

        @media ${SMALL_SCREEN} {
          left: 50%;
          top: 0;
          transform: translateX(-50%);
        }
      `}>
      <button
        className={buttonStyle}
        onClick={() => {
          setCurrentDateTime(d => d.minus({days: 1}));
        }}>
        <LeftIcon />
      </button>
      <div
        className={css`
          text-align: center;
          width: 100px;
        `}>
        {dayOfWeekFormatter.format(currentDateTime)}
        {!isSmall && <br />}
        {dateFormatter.format(currentDateTime)}
      </div>
      <button
        className={buttonStyle}
        onClick={() => {
          setCurrentDateTime(d => d.plus({days: 1}));
        }}>
        <RightIcon />
      </button>
    </div>
  );
}

function CurrentTimeIndicator({currentDateTime}) {
  const time = currentDateTime.toTime();
  const isBeforeStart = Temporal.Time.compare(time, START_TIME) < 0;
  const isAfterEnd = Temporal.Time.compare(time, END_TIME) > 0;

  if (isBeforeStart || isAfterEnd) {
    return (
      <div
        className={css`
          background: red;
          border-radius: 4px;
          color: white;
          font-size: 48px;
          left: 8px;
          padding: 0 4px;
          position: fixed;
          text-align: center;
          width: 190px;

          @media ${SMALL_SCREEN} {
            font-size: 12px;
            left: -12px;
            width: auto;
          }
        `}
        style={{
          bottom: isAfterEnd ? 12 : null,
          top: isBeforeStart ? 64 : null,
        }}>
        {timeFormatter.format(currentDateTime)}
      </div>
    );
  }

  return (
    <div
      className={css`
        border-top: solid 4px red;
        grid-column-start: 1;
        position: relative;

        @media ${SMALL_SCREEN} {
          border-top: solid 2px red;
        }
      `}
      style={{
        gridColumnEnd: CALENDARS.length + 2,
        gridRow: toGridRow(currentDateTime.toTime(), Math.round),
      }}>
      <div
        className={css`
          background: red;
          border-radius: 4px 4px 0 4px;
          color: white;
          font-size: 48px;
          left: -190px;
          padding: 0 4px;
          position: absolute;
          text-align: center;
          transform: translateY(-100%);
          white-space: nowrap;
          width: 190px;

          @media ${SMALL_SCREEN} {
            font-size: 12px;
            left: -12px;
            width: auto;
          }
        `}>
        {timeFormatter.format(currentDateTime)}
      </div>
    </div>
  );
}

// Play silent audio so that Portal will not turn on the screensaver
const audioSrc = createSilentAudio(10);

function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  if (!document.fullscreenEnabled) {
    return null;
  }

  return (
    <>
      <div
        className={css`
          cursor: pointer;
          font-size: 32px;
          padding: 12px;
          position: fixed;
          right: 0;
          top: 0;
        `}>
        {isFullscreen ? (
          <CompressIcon
            color="#aaa"
            onClick={() => {
              document.exitFullscreen();
            }}
          />
        ) : (
          <ExpandIcon
            color="#aaa"
            onClick={() => {
              document.body.firstElementChild.requestFullscreen();
            }}
          />
        )}
      </div>

      {isFullscreen && (
        <audio autoPlay={true} controls={false} loop={true} src={audioSrc} />
      )}
    </>
  );
}

function toGridRow(time, round = Math.floor) {
  return (
    round(time.difference(START_TIME, {largestUnit: 'minutes'}).minutes / 5) +
    1 +
    // Add an extra for the header
    1
  );
}

// eslint-disable-next-line no-unused-vars
function log(value) {
  console.log(value);
  return value;
}

export default App;
