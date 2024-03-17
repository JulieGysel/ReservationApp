import React from 'react';
import '../../index.css';

import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Panel } from 'primereact/panel';
import { Card } from 'primereact/card';
import { SelectButton } from 'primereact/selectbutton';
import { Tooltip } from 'primereact/tooltip';
import { PrimeIcons } from 'primereact/api';
import { Checkbox } from 'primereact/checkbox';
import { Nullable } from 'primereact/ts-helpers';

enum EditMode {
  Toggle,
  Set,
  Clear,
}

export class Cell extends React.Component {
  state = {
    enabled: false,
    hover: false,
  };

  width = '';
  height = '';

  constructor(props: {} | Readonly<{}>) {
    super(props);

    this.width = props['data-width'].toString() + '%';
    this.height = props['data-height'].toString() + '%';
  }

  toPercent(x: number) {
    return (x * 100.0).toString() + '%';
  }

  onClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {}

  public modify(mode: EditMode) {
    let enabled = !this.state.enabled;
    if (mode == EditMode.Clear) {
      enabled = false;
    } else if (mode == EditMode.Set) {
      enabled = true;
    }
    this.setState({ enabled: enabled });
  }

  public setHover(value: any) {
    this.setState({ hover: value });
    // console.log(this.state);
  }

  public setPos(x: any, y: any) {
    // this.setState({ x: this.toPercent(x), y: this.toPercent(y) });
  }

  public setWidth(x: any, y: any) {
    // this.setState({ w: this.toPercent(x), h: this.toPercent(y) });
  }

  public render() {
    /*
    let color = this.state.hover;    
      ? this.state.enabled
        ? 'var(--green-500)'
        : 'var(--surface-400)'
      : this.state.enabled
        ? 'var(--green-300)'
        : 'var(--surface-200)';
    */
    let color = this.state.hover
      ? this.state.enabled
        ? 'var(--primary-500)'
        : 'var(--surface-400)'
      : this.state.enabled
        ? 'var(--primary-300)'
        : 'var(--surface-100)';

    let style = {
      position: 'relative',
      backgroundColor: color,
      width: this.width,
      height: this.height,
      pointerEvents: 'none',
      border: '1px solid var(--surface-600)',
      transition: 'all .3s ease',
      WebkitTransition: 'all .3s ease',
    };
    return <div className="" style={style} onClick={(e) => this.onClick(e)}></div>;
  }
}

export class AvailabilityPanel extends React.Component {
  cols = 7;
  rows = 24;

  cells: any;

  element = React.createRef<HTMLDivElement>();
  isMouseDown = false;

  state = {};

  startPos = {};
  currentPos = {};

  region = { sx: 0, sy: 0, ex: -1, ey: -1 };

  hourLabels: [];

  editMode = EditMode.Toggle;

  constructor(props: {} | Readonly<{}>) {
    super(props);

    this.cells = [];
    for (let i = 0; i < this.cols; ++i) {
      for (let j = 0; j < this.rows; ++j) {
        let ref = React.createRef<Cell>();
        this.cells.push({
          ref: ref,
          elem: (
            <Cell
              data-width={100.0 / this.cols}
              data-height={100.0 / this.rows}
              key={'cell-' + i.toString() + '-' + j.toString()}
              ref={ref}
            ></Cell>
          ),
        });
      }
    }

    this.hourLabels = [];
    for (let i = 0; i < this.rows; ++i) {
      let date = new Date(0);
      date.setHours(i);
      const options = { hour: '2-digit', minute: '2-digit', hour12: false };

      let timeString = date.toLocaleTimeString('en-US', options);
      this.hourLabels.push(timeString);
    }
  }

  getRect() {
    if (!this.element.current) return { x: 0, y: 0, width: 0, height: 0 };
    return this.element.current.getBoundingClientRect();
  }

  isInside(
    pos: { x: any; y: any },
    rect: DOMRect | { x: number; y: number; width: number; height: number },
  ) {
    return pos.x >= 0 && pos.x <= rect.width && pos.y >= 0 && pos.y <= rect.height;
  }

  getMousePos(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = this.getRect();
    return { x: event.clientX - rect.x, y: event.clientY - rect.y };
  }

  getIndex2D(pos, rect) {
    let top = pos.x / rect.width;
    let left = pos.y / rect.height;

    let ix = Math.floor(top * this.cols);
    let iy = Math.floor(left * this.rows);
    return { x: ix, y: iy };
  }

  getIndex(pos, rect) {
    const i = this.getIndex2D(pos, rect);
    return i.y * this.cols + i.x;
  }

  clearHoverRegion() {
    const r = this.region;
    for (let y = r.sy; y <= r.ey; ++y) {
      for (let x = r.sx; x <= r.ex; ++x) {
        let index = y * this.cols + x;
        this.cells[index].ref.current.setHover(false);
      }
    }
    this.region = { sx: 0, sy: 0, ex: -1, ey: -1 };
  }

  onDragOver(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = this.getRect();
    const p = this.getMousePos(event);
    if (!this.isInside(p, rect)) {
      return;
    }

    const i2 = this.getIndex2D(p, rect);
    const i1 = this.isMouseDown ? this.getIndex2D(this.startPos, rect) : i2;

    const start = { x: Math.min(i1.x, i2.x), y: Math.min(i1.y, i2.y) };
    const end = { x: Math.max(i1.x, i2.x), y: Math.max(i1.y, i2.y) };

    this.clearHoverRegion();
    for (let y = start.y; y <= end.y; ++y) {
      for (let x = start.x; x <= end.x; ++x) {
        let index = y * this.cols + x;
        this.cells[index].ref.current.setHover(true);
      }
    }
    this.currentPos = p;
    this.region.sx = start.x;
    this.region.sy = start.y;
    this.region.ex = end.x;
    this.region.ey = end.y;
    event.preventDefault();
  }

  onMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (event.button == 0) {
      if (event.altKey) {
        this.editMode = EditMode.Clear;
      } else if (event.shiftKey) {
        this.editMode = EditMode.Set;
      } else {
        this.editMode = EditMode.Toggle;
      }

      this.isMouseDown = true;
      const rect = this.getRect();
      const p = this.getMousePos(event);
      if (!this.isInside(p, rect)) {
        return;
      }
      this.startPos = p;

      const index = this.getIndex2D(p, rect);
      this.region.sx = index.x;
      this.region.sy = index.y;
      this.region.ex = index.x;
      this.region.ey = index.y;
    }
    // event.preventDefault();
  }

  onMouseLeave(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!this.isMouseDown) {
      this.clearHoverRegion();
    }
    event.preventDefault();
  }

  onMouseEnter(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (event.buttons != 1 && this.isMouseDown) {
      this.clearHoverRegion();
      this.isMouseDown = false;
    }
    event.preventDefault();
  }

  onMouseUp(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (event.button == 0) {
      this.isMouseDown = false;
      const r = this.region;
      for (let y = r.sy; y <= r.ey; ++y) {
        for (let x = r.sx; x <= r.ex; ++x) {
          let index = y * this.cols + x;
          this.cells[index].ref.current.setHover(false);
          this.cells[index].ref.current.modify(this.editMode);
        }
      }
    }
    event.preventDefault();
  }

  onKeyUp(event) {
    if (event.key === 'Escape') {
      const rect = this.getRect();
      const index = this.getIndex(this.currentPos, rect);
      this.clearHoverRegion();
      this.cells[index].ref.current.setHover(true);
      this.startPos = this.currentPos;
    }
  }

  onClear() {
    for (let c of this.cells) {
      c.ref.current.modify(EditMode.Clear);
    }
  }

  public render() {
    return (
      <div className={'flex'}>
        <Panel header="Availability" toggleable>
          <div style={{ display: 'inline' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ visibility: 'hidden', width: '3em' }}></div>
              <div className="flex flex-none" style={{ gridColumn: '1', gridRow: '1' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                  <div
                    key={'daylabel-' + i.toString()}
                    style={{ width: (100.0 / this.cols).toString() + '%' }}
                  >
                    <Card
                      pt={{
                        body: { style: { padding: '0' } },
                        content: { style: { padding: '0.5em 1em' } },
                      }}
                      style={{ margin: '8px' }}
                    >
                      <div className="text-center">{d}</div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'hidden', maxHeight: '70svh' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3em auto',
                }}
              >
                <div
                  className="flex-col h-full items-center"
                  style={{ gridColumn: '1', gridRow: '1' }}
                >
                  {this.hourLabels.map((d, i) => (
                    <div key={'timelabel-' + i.toString()} className="mb-4">
                      {d}
                    </div>
                  ))}
                </div>
                <div
                  ref={this.element}
                  tabIndex={0}
                  className="flex flex-none flex-wrap items-start"
                  style={{
                    width: '100%',
                    height: '100%',
                    gridColumn: '2',
                    gridRow: '1',
                    outline: 'none',
                    border: '1px solid var(--surface-600)',
                  }}
                  onMouseMove={(e) => this.onDragOver(e)}
                  onMouseDown={(e) => this.onMouseDown(e)}
                  onMouseUp={(e) => this.onMouseUp(e)}
                  onMouseLeave={(e) => this.onMouseLeave(e)}
                  onMouseEnter={(e) => this.onMouseEnter(e)}
                  onKeyUp={(e) => this.onKeyUp(e)}
                >
                  {this.cells.map((d: { elem: any }) => d.elem)}
                </div>
              </div>
            </div>
            <div className="flex w-full mt-2" style={{ justifyContent: 'flex-end' }}>
              <SelectButton options={['1', '2', '3']} className="mr-4" />
              <Button
                onClick={() => this.onClear()}
                severity="secondary"
                className={`pi ${PrimeIcons.TRASH}`}
              ></Button>
            </div>
          </div>
        </Panel>
      </div>
    );
  }
}

export const CreateResource = () => {
  const [name, setName] = useState('');

  const [timeslot, setTimeslot] = useState<Nullable<Date>>(new Date('1 Jan 1970 00:30:00'));
  const [timeMax, setTimeMax] = useState<Nullable<Date>>(new Date('1 Jan 1970 00:30:00'));

  const privacyOptions = [
    { label: 'everyone', value: '1' },
    { label: 'signed-id', value: '2' },
    { label: 'whitelist', value: '3' },
  ];

  const [privacy, setPrivacy] = useState(privacyOptions[0]);

  const [flagAnonymous, setFlagAnonymous] = useState(false);

  const [showWhitelist, setShowWhitelist] = React.useState(false);

  const [valid, setValid] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // event.preventDefault();
    //let formData = new FormData(event.currentTarget);
  }

  function onNameChange(value) {
    setValid(value != '');
  }

  // useEffect(() => {
  //   setPrivacy(privacyOptions[0]);
  // }, []);

  return (
    <div className={'flex flex-row align-items-start h-full'}>
      <div className={'flex flex-column align-items-start h-full'}>
        <form onSubmit={handleSubmit}>
          <Panel header="Resource" toggleable>
            <div className="flex flex-column gap-2">
              <label htmlFor="name">Name</label>
              <InputText
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  onNameChange(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-column gap-2">
              <label htmlFor="description">Description</label>
              <InputTextarea id="description" autoResize rows={2} cols={30} />
            </div>
          </Panel>
          <Panel header="Privacy" toggleable>
            <div className="flex flex-row align-items-center gap-2">
              <SelectButton
                options={privacyOptions}
                value={privacy}
                onChange={(e) => {
                  setPrivacy(e.target.value);
                  setShowWhitelist(e.target.value === '3');
                }}
              />
              <span
                id="tooltip_privacy"
                className={`tooltip-privacy pi ${PrimeIcons.INFO_CIRCLE} mx-2`}
              />
              <Tooltip target=".tooltip-privacy">
                <div className="flex align-items-center">TODO text</div>
              </Tooltip>
            </div>
            <div className="pt-2">
              <Checkbox
                inputId="checkbox_anonymous"
                checked={flagAnonymous}
                onChange={(e) => setFlagAnonymous(e.checked)}
              ></Checkbox>
              <label htmlFor="checkbox_anonymous" className="ml-2">
                Anonymous reservations
              </label>
            </div>
          </Panel>
          {showWhitelist ? <Panel header="User whitelist" toggleable></Panel> : null}

          <Panel header="Reservation limits" toggleable>
            <div className="flex flex-row align-items-center gap-2">
              <div className="flex flex-column gap-2">
                <label htmlFor="capacity">Capacity</label>
                <InputNumber id="capacity" min={1} value={1} showButtons></InputNumber>
                <label htmlFor="timeslot">Timeslot</label>
                <Calendar
                  id="timeslot"
                  value={timeslot}
                  onChange={(e) => setTimeslot(e.value)}
                  timeOnly
                />
                <label htmlFor="maximum">Maximum</label>
                <Calendar
                  id="maximum"
                  value={timeMax}
                  onChange={(e) => setTimeMax(e.value)}
                  timeOnly
                />
              </div>
            </div>
          </Panel>
          <div
            className="flex w-full pb-4 pt-4"
            style={{
              justifyContent: 'center',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--surface-card)',
            }}
          >
            <Button
              label="Create"
              type="submit"
              icon="pi pi-check"
              className="font-semibold"
              disabled={!valid}
            />
          </div>
        </form>
      </div>
      <AvailabilityPanel></AvailabilityPanel>
    </div>
  );
};
