import { SetStateAction, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './TimeView.css';
import { useRef } from 'react';
import { Divider } from 'primereact/divider';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Link } from 'react-router-dom';

function getMonday(d: Date) {
  d = new Date(d.toDateString());
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getWeek(d: Date): Date[] {
  var week = new Array();
  d = new Date(d);
  for (var i = 0; i < 7; i++) {
    week.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return week;
}

function datesAreOnSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function dayTimeFraction(date: Date) {
  return (date.getSeconds() + date.getMinutes() * 60 + date.getHours() * 3600) / (60 * 60 * 24);
}

class ReservedTime {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  avatarColor: string;
  from: Date;
  to: Date;
  owned: boolean;

  constructor(
    start: Date,
    end: Date,
    {
      owned = false,
      name = null,
      email = null,
      avatarUrl = null,
      avatarColor = 'var(--teal-500)',
    }: {
      owned?: boolean;
      name?: string | null;
      email?: string | null;
      avatarUrl?: string | null;
      avatarColor?: string;
    },
  ) {
    this.from = start;
    this.to = end;
    this.owned = owned;
    this.name = name;
    this.email = email;
    this.avatarUrl = avatarUrl;
    this.avatarColor = avatarColor;
  }
}

export function TimeView() {
  useEffect(ColumnsScrolled, []);

  const startDay = getMonday(new Date(Date.now()));
  const week = getWeek(startDay);

  const [selectStart, setSelectStart] = useState(new Date());
  const [selectEnd, setSelectEnd] = useState(new Date());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(
    new ReservedTime(new Date(), new Date(), {}),
  );
  const [selectYInitial, setSelectYInitial] = useState(0);
  const [selectHInitial, setSelectHInitial] = useState(0);
  const [selectActive, setSelectActive] = useState(false);
  const [selectTopHandleDrag, setSelectTopHandleDrag] = useState(false);
  const [selectBottomHandleDrag, setSelectBottomHandleDrag] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollH, setScrollH] = useState(0);
  const [reservedTimes, setReservedTimes] = useState([
    new ReservedTime(
      new Date(week[0].getTime() + 1000 * 60 * 60 * 9),
      new Date(week[0].getTime() + 1000 * 60 * 60 * 11),
      {
        owned: true,
        name: 'Joe Smith',
        email: 'smithy2@gmail.com',
      },
    ),
    new ReservedTime(
      new Date(week[2].getTime() + 1000 * 60 * 60 * 16),
      new Date(week[2].getTime() + 1000 * 60 * 60 * 17),
      {
        name: 'Lucy Brown',
        avatarUrl: 'https://randomuser.me/api/portraits/women/79.jpg',
      },
    ),
    new ReservedTime(
      new Date(week[5].getTime() + 1000 * 60 * 60 * 11),
      new Date(week[5].getTime() + 1000 * 60 * 60 * 14.5),
      {
        avatarColor: '#4a78bd',
      },
    ),
  ]);

  const detailW = 1;
  const detailX = week.findIndex((x) => datesAreOnSameDay(x, selectedReservation?.from));
  const detailYstart = dayTimeFraction(selectedReservation?.from) * 24;
  const detailYend =
    dayTimeFraction(selectedReservation?.to) * 24 +
    (datesAreOnSameDay(selectedReservation?.from, selectedReservation?.to) ? 0 : 24);

  const selectW = 1;
  const selectX = week.findIndex((x) => datesAreOnSameDay(x, selectStart));
  const selectYstart = dayTimeFraction(selectStart) * 24;
  const selectYend =
    dayTimeFraction(selectEnd) * 24 + (datesAreOnSameDay(selectStart, selectEnd) ? 0 : 24);

  const dayColumnsRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef(0);

  function ApplyConstrainsSelectEnd(endTime: Date, startTime: Date) {
    reservedTimes.forEach((reservedTime) => {
      if (reservedTime.from < endTime && startTime < reservedTime.from) {
        endTime = new Date(reservedTime.from.getTime());
      }
    });
    if (endTime.getHours() > 21 || (endTime.getHours() == 21 && endTime.getMinutes() > 0)) {
      endTime.setHours(21);
      endTime.setMinutes(0);
    }
    if (endTime.getHours() == 0) {
      endTime.setDate(endTime.getDate() - 1);
      endTime.setHours(21);
      endTime.setMinutes(0);
    }
    return endTime;
  }

  function SetSelectEndChecked(time: Date) {
    setSelectEnd(ApplyConstrainsSelectEnd(time, selectStart));
  }

  function ApplyConstrainsSelectStart(startTime: Date, endTime: Date) {
    reservedTimes.forEach((reservedTime) => {
      if (reservedTime.to > startTime && endTime > reservedTime.to) {
        startTime = new Date(reservedTime.to.getTime());
      }
    });
    if (startTime.getHours() < 7) {
      startTime.setHours(7);
      startTime.setMinutes(0);
    }
    return startTime;
  }

  function SetSelectStartChecked(time: Date) {
    setSelectStart(ApplyConstrainsSelectStart(time, selectEnd));
  }

  function ColumnsScrolled() {
    const columnsNode = columnsRef.current;
    if (columnsNode) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setScrollY(columnsNode.scrollTop);
        setScrollH(columnsNode.clientHeight);
      }, 100);
    }
  }

  function HourToTimeString(hour: number) {
    return hour.toString().padStart(2, '0') + ':00';
  }

  function ExtendSelect(to: number) {
    if (to < selectYInitial + selectHInitial) {
      BottomHandleDragged(selectYInitial + selectHInitial - 0.01);
      to = Math.min(to, selectYInitial);
      TopHandleDragged(to);
    }
    if (to > selectYInitial) {
      TopHandleDragged(selectYInitial);
      to = Math.max(to, selectYInitial + selectHInitial - 0.01);
      BottomHandleDragged(to);
    }
  }

  function DateToHoursMinutes(date: Date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function TopHandleDragged(time: number) {
    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 4) * 15;
    const newStartDate = new Date(selectStart);
    newStartDate.setHours(hours);
    newStartDate.setMinutes(minutes);
    const maxAllowedDate = new Date(selectEnd.getTime() - 15 * 60 * 1000);
    if (newStartDate.getTime() > maxAllowedDate.getTime()) {
      newStartDate.setTime(maxAllowedDate.getTime());
    }
    if (newStartDate.getTime() != selectStart.getTime()) {
      SetSelectStartChecked(newStartDate);
    }
  }

  function BottomHandleDragged(time: number) {
    const hours = Math.floor(time + 0.25);
    const minutes = (Math.floor((time - hours) * 4) + 1) * 15;
    const newEndDate = new Date(selectEnd);
    newEndDate.setHours(hours);
    newEndDate.setMinutes(minutes);
    if (hours >= 24) {
      newEndDate.setDate(selectStart.getDate() + 1);
      newEndDate.setMinutes(0);
    } else {
      newEndDate.setDate(selectStart.getDate());
    }
    const minAllowedDate = new Date(selectStart.getTime() + 15 * 60 * 1000);
    if (newEndDate.getTime() < minAllowedDate.getTime()) {
      newEndDate.setTime(minAllowedDate.getTime());
    }
    if (newEndDate.getTime() != selectEnd.getTime()) {
      SetSelectEndChecked(newEndDate);
    }
  }

  function GetPointerTime(e: React.PointerEvent<HTMLDivElement>) {
    const columnsNode = dayColumnsRef.current;
    if (columnsNode) {
      const divRect = columnsNode.getBoundingClientRect();
      return Math.min(24, Math.max(0, ((e.clientY - divRect.top) / divRect.height) * 24));
    }
    return 0;
  }

  function StartSelect(hour: number, day: Date) {
    setIsDetailOpen(false);
    let selectStartDate = new Date(day);
    selectStartDate.setHours(hour);
    let selectEndDate = new Date(day);
    selectEndDate.setHours(hour + 1);
    console.log('first: ' + selectStartDate);
    selectStartDate = ApplyConstrainsSelectStart(selectStartDate, selectEndDate);
    console.log('after: ' + selectStartDate);
    selectEndDate = ApplyConstrainsSelectEnd(selectEndDate, selectStartDate);
    if (selectStartDate >= selectEndDate) {
      return;
    }
    const startY = dayTimeFraction(selectStartDate) * 24;
    const endY =
      dayTimeFraction(selectEndDate) * 24 +
      (datesAreOnSameDay(selectStartDate, selectEndDate) ? 0 : 24);
    setSelectYInitial(startY);
    setSelectHInitial(endY - startY);
    setSelectStart(selectStartDate);
    setSelectEnd(selectEndDate);
    setSelectActive(true);
  }

  function ColumnsPointerDown(e: React.PointerEvent<HTMLDivElement>, day: Date) {
    if (e.pointerType == 'touch' || e.buttons % 2 != 1) {
      return;
    }
    if (selectActive) {
      setSelectActive(false);
      return;
    }
    const hour = Math.floor(GetPointerTime(e));
    StartSelect(hour, day);
  }

  function ColumnsPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType == 'touch') {
      return;
    }
    if (!selectActive || e.buttons % 2 != 1) {
      ResetInput();
      return;
    }
    const time = GetPointerTime(e);
    InputMoved(time);
  }

  function ColumnsPointerUp(e: React.PointerEvent<HTMLDivElement>, day: Date) {
    if (e.pointerType != 'touch') {
      return;
    }
    if (selectActive) {
      setSelectActive(false);
      return;
    }
    const hour = Math.floor(GetPointerTime(e));
    StartSelect(hour, day);
  }

  function InputMoved(time: number) {
    if (selectTopHandleDrag) {
      TopHandleDragged(time);
    } else if (selectBottomHandleDrag) {
      BottomHandleDragged(time);
    } else {
      ExtendSelect(time);
    }
  }

  function ResetInput() {
    if (selectTopHandleDrag) {
      setSelectTopHandleDrag(false);
    }
    if (selectBottomHandleDrag) {
      setSelectBottomHandleDrag(false);
    }
  }

  function HandlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!selectActive || e.pointerType != 'touch') {
      return;
    }
    InputMoved(GetPointerTime(e));
  }

  function OpenReservationDetail(reservation: ReservedTime) {
    setSelectedReservation(reservation);
    setSelectActive(false);
    setIsDetailOpen(true);
  }

  function deleteOpenedDetail() {}

  const dayHeaders: JSX.Element[] = [];
  const dayColumns: JSX.Element[] = [];
  const hourTicks: JSX.Element[] = [];
  const reservedBoxes: JSX.Element[] = [];

  week.forEach((day, index) => {
    const headerClass = selectActive && selectX == index ? 'header selected' : 'header';
    dayHeaders.push(
      <div className={headerClass} key={`day-header-${index}`}>
        <div className="long-day" key={`long-day-${index}`}>
          {day.toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
        <div className="short-day" key={`shgort-day-${index}`}>
          {day.toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
        <div className="day-number" key={`day-number-${index}`}>
          {day.toLocaleDateString('en-US', { day: 'numeric' })}
        </div>
      </div>,
    );

    const columnCells: JSX.Element[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const isSelected =
        selectActive && selectX == index && selectYstart < hour + 1 && selectYend > hour;
      const isAvailable = hour >= 7 && hour < 21;
      const classes =
        'cell' + (isSelected ? ' selected' : '') + (isAvailable ? '' : ' not-available');

      columnCells.push(
        <div className={classes} key={`cell-${index}-${hour}`}>
          <div className="hour-label">{HourToTimeString(hour)}</div>
        </div>,
      );
    }

    dayColumns.push(
      <div
        className="day-column"
        onPointerDown={(e) => ColumnsPointerDown(e, day)}
        onPointerUp={(e) => ColumnsPointerUp(e, day)}
        onPointerMove={(e) => ColumnsPointerMove(e)}
        key={`day-column-${index}`}
      >
        {columnCells}
      </div>,
    );
  });

  for (let hour = 1; hour < 24; hour++) {
    hourTicks.push(
      <div className="hour" key={`hour-${hour}`}>
        <div className="label">{HourToTimeString(hour)}</div>
      </div>,
    );
  }

  reservedTimes.forEach((res, index) => {
    const boxW = 1;
    const boxX = week.findIndex((x) => datesAreOnSameDay(x, res.from));
    const boxYstart = dayTimeFraction(res.from) * 24;
    const boxYend = dayTimeFraction(res.to) * 24 + (datesAreOnSameDay(res.from, res.to) ? 0 : 24);

    const reservedBoxStyles = {
      '--box-x': boxX,
      '--box-y': boxYstart,
      '--box-w': boxW,
      '--box-h': boxYend - boxYstart,
      backgroundColor: res.owned ? 'var(--blue-200)' : 'var(--surface-border)',
    } as React.CSSProperties;

    reservedBoxes.push(
      <div
        className="reserved-box"
        style={reservedBoxStyles}
        key={`reserved-time-${index}`}
        onClick={() => OpenReservationDetail(res)}
      >
        <div className="time">
          {DateToHoursMinutes(res.from)}-{DateToHoursMinutes(res.to)}
        </div>
        <Avatar
          image={res.avatarUrl ?? undefined}
          shape="circle"
          icon="pi pi-user"
          style={{ backgroundColor: res.avatarColor, color: '#ffffff' }}
        />
      </div>,
    );
  });

  const styles = {
    '--detail-y-initial': detailYstart,
    '--detail-x': detailX,
    '--detail-y': detailYstart,
    '--detail-w': detailW,
    '--detail-h': detailYend - detailYstart,

    '--select-y-initial': selectYInitial,
    '--select-x': selectX,
    '--select-y': selectYstart,
    '--select-w': selectW,
    '--select-h': selectYend - selectYstart,
    '--scroll-y': scrollY + 'px',
    '--scroll-h': scrollH + 'px',
  } as React.CSSProperties;

  const dayColumnsClasses = selectActive ? 'day-columns select-active' : 'day-columns';
  const isSelectRight = selectX < Math.floor(7 / 2);
  const selectPopupClasses =
    'select-popup popup ' + (isSelectRight ? 'right' : 'left') + (isConfirmOpen ? ' open' : '');
  const confirmOpenButtonClasses =
    'confirm-open-button ' + (isSelectRight ? 'right' : 'left') + (isConfirmOpen ? ' open' : '');
  window.addEventListener('resize', ColumnsScrolled);
  // selectedReservation

  const isDetailRight = detailX < Math.floor(7 / 2);
  const detailPopupClasses =
    'detail-popup popup ' + (isDetailRight ? 'right' : 'left') + (isDetailOpen ? ' open' : '');

  return (
    <div className="timeview">
      <div className="headers">
        <div className="corner"></div>
        {dayHeaders}
      </div>
      <div className="columns" onScroll={ColumnsScrolled} ref={columnsRef} style={styles}>
        <div className="hour-labels"></div>
        <div className="hour-ticks">{hourTicks}</div>
        <div className={dayColumnsClasses} ref={dayColumnsRef}>
          <div className="selected-background"></div>
          <div className="selected-time start">{DateToHoursMinutes(selectStart)}</div>
          <div className="selected-time end">{DateToHoursMinutes(selectEnd)}</div>
          {dayColumns}
          {reservedBoxes}
          <div className="select-box">
            <div className="hour-range">
              {DateToHoursMinutes(selectStart)} - {DateToHoursMinutes(selectEnd)}
            </div>
            <div
              className="handle top"
              onPointerDown={() => setSelectTopHandleDrag(true)}
              onPointerMove={(e) => HandlePointerMove(e)}
              onPointerUp={() => setSelectTopHandleDrag(false)}
            ></div>
            <div
              className="handle bottom"
              onPointerDown={() => setSelectBottomHandleDrag(true)}
              onPointerMove={(e) => HandlePointerMove(e)}
              onPointerUp={() => setSelectBottomHandleDrag(false)}
            ></div>
          </div>
          <div className={confirmOpenButtonClasses}>
            <div className={`flex gap-3 ${isSelectRight ? 'flex-row-reverse' : ''}`}>
              <Button
                icon="pi pi-check"
                onClick={() => {
                  setReservedTimes([
                    ...reservedTimes,
                    new ReservedTime(selectStart, selectEnd, { owned: true, name: 'Joe Smith' }),
                  ]);
                  setIsConfirmOpen(false);
                  setSelectActive(false);
                }}
              />
              <Button
                icon="pi pi-ellipsis-h"
                onClick={() => {
                  setIsConfirmOpen(true);
                }}
              />
            </div>
          </div>
          <div className={selectPopupClasses}>
            <div className="header flex align-items-center">
              <div className="title">Reservation</div>
              <Button
                icon="pi pi-times"
                onClick={() => setIsConfirmOpen(false)}
                text
                severity={'secondary'}
              />
            </div>

            <Divider />
            <div className="content">
              <div className="flex-row align-items-center">
                <div className="flex-grow">
                  {selectStart.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <Button text label="Reocurring?" />
              </div>
              <div className="flex-row align-items-center gap-16px">
                <div>
                  <Calendar
                    value={selectStart}
                    onChange={(e) => {
                      if (e.value != null) setSelectStart(e.value);
                    }}
                    timeOnly
                  />
                </div>
                <div>—</div>
                <div>
                  <Calendar
                    value={selectEnd}
                    onChange={(e) => {
                      if (e.value != null) setSelectEnd(e.value);
                    }}
                    timeOnly
                  />
                </div>
              </div>
              <span className="flex-col p-input-icon-left">
                <i className="pi pi-user" />
                <InputText placeholder="Your name (optional)" />
              </span>
              <span className="flex-col p-input-icon-left">
                <i className="pi pi-at" />
                <InputText placeholder="Your email (optional)" />
              </span>
              <div className="flex-row align-items-center">
                <div className="flex-grow"></div>
                <Button text>Sign in</Button>
              </div>
            </div>
            <Divider />
            <div className="footer flex justify-content-right gap-2">
              <Button
                onClick={() => {
                  setReservedTimes([
                    ...reservedTimes,
                    new ReservedTime(selectStart, selectEnd, { owned: true, name: 'Joe Smith' }),
                  ]);
                  setIsConfirmOpen(false);
                  setSelectActive(false);
                }}
              >
                Reserve
              </Button>
              <Button
                outlined
                onClick={() => {
                  setIsConfirmOpen(false);
                  setSelectActive(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
          <div className={detailPopupClasses}>
            <div className="header flex align-items-center">
              <div className="title">Reservation detail</div>
              <Button
                icon="pi pi-times"
                onClick={() => setIsDetailOpen(false)}
                text
                severity={'secondary'}
              />
            </div>

            <Divider />
            <div className="content">
              <div className="flex-row justify-content-between">
                <div className="text-xl">{selectedReservation?.name ?? 'Guest'}</div>
                {selectedReservation.owned && (
                  // <Button  icon="pi pi-trash" className="p-button-rounded p-button-danger p-ml-2"  onClick={() => deleteOpenedDetail()} />
                  <Button
                    text
                    onClick={() => {
                      setReservedTimes([
                        ...reservedTimes.filter((res) => res != selectedReservation),
                      ]);
                      setIsDetailOpen(false);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div className="flex-row justify-content-between">
                <div>
                  {selectedReservation?.from.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {selectedReservation?.to.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div>
                  {selectedReservation?.from.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
