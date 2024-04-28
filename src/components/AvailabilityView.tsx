import React from 'react';

import './AvailabilityView.css';

import { EditMode, Cell } from './Cell';

import { Button } from 'primereact/button';
import { PrimeIcons } from 'primereact/api';

import { OverlayPanel } from 'primereact/overlaypanel';

import { TimeInputField, SvgRoundButton, SvgIcons } from '.';

function toPercent(value: number) {
  return (100.0 * value).toString() + '%';
}

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public eq(o: Point) {
    return Math.fround(this.x) == Math.fround(o.x) && Math.fround(this.x) == Math.fround(o.x);
  }
}

class RelativeCell extends React.Component<React.PropsWithChildren<{ className?: string }>> {
  state = {
    x: '0%',
    y: '0%',
    width: '0%',
    height: '0%',
    zIndex: 0,
    visible: true,
  };

  flag = true;
  className = '';
  group = { start: 0, end: -1, x: -1 };

  constructor(props: any) {
    super(props);
    this.className = props.className || '';

    this.state.x = props['data-x'];
    this.state.y = props['data-y'];
    this.state.width = props['data-width'];
    this.state.height = props['data-height'];
    this.state.zIndex = props['data-z-index'];

    if (props['data-group']) {
      this.group = props['data-group'];
    }
  }

  public useTop(enabled: boolean) {
    this.setState({
      useTop: enabled,
    });
  }

  public setPos(x: string, y: string) {
    this.setState({
      x: x,
      y: y,
    });
  }

  public setHeight(h: string) {
    this.setState({
      height: h,
    });
  }

  public setVisible(value: boolean) {
    this.setState({
      visible: value,
    });
  }

  public render() {
    return (
      <div
        className={this.className}
        style={{
          zIndex: this.state.zIndex,
          position: 'absolute',
          width: this.state.width,
          height: this.state.height,
          left: this.state.x,
          top: this.state.y,
          opacity: this.state.visible ? '1' : '0',
        }}
      >
        {this.props.children}
      </div>
    );
  }
}

class Region extends RelativeCell {
  constructor(props: any) {
    super(props);
  }
}

export class AvailabilityView extends React.Component {
  cellSplit = 4;
  hours = 24;
  cols = 7;
  rows = this.hours * this.cellSplit;

  cells: any;
  columns: any;

  element = React.createRef<HTMLDivElement>();
  hoverOverlay = React.createRef<RelativeCell>();
  deleteOverlay = React.createRef<RelativeCell>();

  isMouseDown = false;
  minExtraHeight = 1.5;
  defaultExtraHeight = 3.0;

  state = {
    hoverOverlayText: '',
    extraHeight: this.defaultExtraHeight,
    columns: [],
  };

  startPos = new Point(0, 0);
  currentPos = {};
  currentGroup = { start: 0, end: -1, x: -1 };
  movingGroupStart = false;
  movingGroup = false;
  movingGroupPos = new Point(0, 0);
  movingAnchor = 0;
  adjustGroupStart = false;
  adjustGroupDirection = 0;
  adjustGroupUp = false;
  adjustGroupDown = false;

  region = { sx: 0, sy: 0, ex: -1, ey: -1 };

  hourLabels: string[];

  editMode = EditMode.Set;

  counter = 0;

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  day_refs: React.RefObject<OverlayPanel>[];

  constructor(props: {} | Readonly<{}>) {
    super(props);
    this.cells = [];
    this.day_refs = [];
    for (let j = 0; j < this.rows; ++j) {
      for (let i = 0; i < this.cols; ++i) {
        const round = j % this.cellSplit == 0;
        let ref = React.createRef<Cell>();
        this.cells.push({
          ref: ref,
          elem: (
            <Cell
              data-width={100.0 / this.cols}
              data-height={100.0 / this.rows}
              data-dotted={!round}
              data-borders={[j != 0 && round, true, true, true]}
              data-id={i.toString() + '-' + j.toString()}
              key={'cell-' + i.toString() + '-' + j.toString()}
              ref={ref}
            ></Cell>
          ),
          group: { start: -1, end: -1, x: -1 },
        });
      }
    }

    for (let _ of this.days) {
      this.day_refs.push(React.createRef<OverlayPanel>());
    }

    this.hourLabels = [...Array(this.hours).keys()].map((i) =>
      this.indexToTime(i * this.cellSplit),
    );

    this.columns = [];
    for (let _d of this.days) {
      this.columns.push([]);
    }
  }

  makeRegionElement(moving: boolean, x: number, y: number, height: number) {
    let ref = React.createRef<RelativeCell>();
    const text = this.indexToTimeRange(y, y + height);
    return {
      ref: ref,
      element: (
        <Region
          className={moving ? 'region moving' : 'region'}
          ref={ref}
          key={this.counter + (moving ? 'M' : 'R') + '-' + x + '-' + y}
          data-z-index={6}
          data-width={'calc(' + toPercent(1.0 / this.cols) + ' - 5px)'}
          data-height={toPercent(height / this.rows)}
          data-x={toPercent(x / this.cols)}
          data-y={toPercent(y / this.rows)}
          data-group={{ start: y, end: y + height, x: x }}
        >
          {!moving && (
            <div
              className="handle top"
              onMouseDown={() => {
                this.startAdjustGroup(-1);
              }}
            ></div>
          )}
          <div className={'text' + (height < this.cellSplit ? ' smallCell' : '')}>{text}</div>
          {!moving && (
            <div
              className="handle bottom"
              onMouseDown={() => {
                this.startAdjustGroup(1);
              }}
            ></div>
          )}
        </Region>
      ),
    };
  }

  componentDidMount(): void {
    this.deleteOverlay.current?.setState({
      width: toPercent(1.0 / this.cols),
      height: toPercent(1.0 / this.rows),
    });
    this.hoverOverlay.current?.setState({
      width: toPercent(1.0 / this.cols),
      height: toPercent(1.0 / this.rows),
    });
    this.deleteOverlay.current?.setVisible(false);
  }

  get(x: number, y: number) {
    return this.cells[x + y * this.cols];
  }

  getCell(x: number, y: number) {
    return this.get(x, y).ref.current;
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

  getMousePos(p: Point) {
    const rect = this.getRect();
    return new Point(p.x - rect.x, p.y - rect.y);
  }

  getSubIndexY(y: number, rect: { x: number; y: number; width: number; height: number }) {
    const top = y / rect.height;
    return Math.floor(top * this.rows * 2);
  }

  getIndex2D(pos: Point, rect: { x: number; y: number; width: number; height: number }) {
    const left = pos.x / rect.width;
    const top = pos.y / rect.height;
    return { x: Math.floor(left * this.cols), y: Math.floor(top * this.rows) };
  }

  getIndex(pos: Point, rect: { x: number; y: number; width: number; height: number }) {
    const i = this.getIndex2D(pos, rect);
    return i.y * this.cols + i.x;
  }

  clearHoverRegion() {
    const r = this.region;
    for (let y = r.sy; y <= r.ey; ++y) {
      for (let x = r.sx; x <= r.ex; ++x) {
        this.getCell(x, y).setHover(false);
      }
    }
    this.region = { sx: 0, sy: 0, ex: -1, ey: -1 };
  }

  indexToTime(y: number) {
    let date = new Date(0);
    date.setHours(y / this.cellSplit);
    date.setMinutes((y % this.cellSplit) * (60 / this.cellSplit));
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  indexToTimeRange(start: number, end: number) {
    let s = this.indexToTime(start) + ' - ' + this.indexToTime(end);
    let am = s.split('AM');
    if (am.length == 3) {
      return am[0] + am[1] + 'AM';
    }
    let pm = s.split('PM');
    if (pm.length == 3) {
      return pm[0] + pm[1] + 'PM';
    }
    return s;
  }

  onInputMove(event: Point) {
    const rect = this.getRect();
    const p = this.getMousePos(event);
    if (!this.isInside(p, rect)) {
      return false;
    }

    const i1 = this.getIndex2D(this.startPos, rect);
    const i2 = this.getIndex2D(p, rect);

    if (!this.isMouseDown) {
      let y = Math.floor(i2.y / this.cellSplit);
      if (
        !this.getCell(i2.x, i2.y).isEnabled() &&
        !this.getCell(i2.x, y * this.cellSplit).isEnabled()
      ) {
        this.hoverOverlay.current?.setPos(toPercent(i2.x / this.cols), toPercent(y / this.hours));
        this.hoverOverlay.current?.setVisible(true);
        this.setState({
          hoverOverlayText: this.indexToTime(y * this.cellSplit),
        });
      } else {
        this.hoverOverlay.current?.setVisible(false);
      }
    }

    if (this.isMouseDown) {
      let x = i1.x;
      let start = { x: Math.min(i1.x, x), y: Math.min(i1.y, i2.y) };
      let end = { x: Math.max(i1.x, x), y: Math.max(i1.y, i2.y) };

      let g = this.currentGroup;
      if (this.movingGroup) {
        this.movingGroupPos.x = i2.x;
        this.movingGroupPos.y = i2.y;
        start = i2;
        start.y = Math.max(0, start.y - this.movingAnchor);
        end = { x: start.x, y: Math.min(this.rows - 1, start.y + (g.end - g.start)) };
      } else if (this.adjustGroupUp) {
        start.y = Math.min(g.end, i2.y);
        end.y = g.end;
      } else if (this.adjustGroupDown) {
        start.y = g.start;
        end.y = Math.max(start.y, i2.y);
      } else if (this.movingGroupStart) {
        this.movingGroup = true;
        this.movingGroupStart = false;
        this.movingAnchor = i2.y - g.start;
        for (let y = g.start; y <= g.end; ++y) {
          this.getCell(g.x, y).modify(EditMode.Clear);
        }
      } else if (this.adjustGroupStart) {
        this.adjustGroupUp = this.adjustGroupDirection == -1;
        this.adjustGroupDown = this.adjustGroupDirection == 1;
        this.adjustGroupStart = false;
        for (let y = g.start; y <= g.end; ++y) {
          this.getCell(g.x, y).modify(EditMode.Clear);
        }
        for (let y = g.start; y <= g.end; ++y) {
          this.getCell(g.x, y).setHover(true);
        }
      }

      let old = this.region;
      this.clearHoverRegion();
      for (let y = start.y; y <= end.y; ++y) {
        for (let x = start.x; x <= end.x; ++x) {
          this.getCell(x, y).setHover(true);
        }
      }

      this.currentPos = p;
      this.region = { sx: start.x, sy: start.y, ex: end.x, ey: end.y };

      this.updateRegion(old);
      this.updateRegion(this.region);
    }

    return true;
  }

  onMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (this.onInputMove(new Point(event.clientX, event.clientY))) {
      event.preventDefault();
    }
  }

  onTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    const t = event.touches[0];
    event.stopPropagation();
    if (this.onInputMove(new Point(t.clientX, t.clientY))) {
      event.stopPropagation();
    }
  }

  onTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const t = event.changedTouches[0];
    event.preventDefault();
    event.stopPropagation();
    this.onInputUp(new Point(t.clientX, t.clientY));
  }

  onInputDown(event: Point) {
    this.isMouseDown = true;
    const rect = this.getRect();
    const p = this.getMousePos(event);
    if (!this.isInside(p, rect)) {
      return false;
    }
    this.startPos = p;

    const index = this.getIndex2D(p, rect);
    let c = this.get(index.x, index.y);

    this.region = { sx: index.x, sy: index.y, ex: index.x, ey: index.y };
    if (!c.ref.current.enabled) {
      this.region.ey = Math.min(this.rows - 1, index.y + this.cellSplit - 1);
    }

    this.updateRegion(this.region);

    this.hoverOverlay.current?.setVisible(false);
    this.deleteOverlay.current?.setVisible(false);

    this.currentGroup = c.group;

    if (c.ref.current.enabled) {
      if (!this.adjustGroupStart) {
        this.startMovingGroup();
      }
    } else {
      this.stopMovingGroup();
      this.stopAdjustGroup();
    }

    return true;
  }

  public startAdjustGroup(direction: number) {
    this.adjustGroupStart = true;
    this.adjustGroupDirection = direction;
    this.adjustGroupUp = false;
    this.adjustGroupDown = false;
  }

  startMovingGroup() {
    this.movingGroupStart = true;
    this.movingGroup = false;
  }

  stopAdjustGroup(confirm = false) {
    this.adjustGroupStart = false;
    if (this.adjustGroupUp || this.adjustGroupDown) {
      this.adjustGroupUp = false;
      this.adjustGroupDown = false;

      let g = this.currentGroup;
      let x = g.x;
      for (let y = g.start; y <= g.end; ++y) {
        if (confirm) {
          this.getCell(x, y).modify(EditMode.Clear);
        }
      }
      if (confirm) {
        let r = this.region;
        let x = r.sx;
        for (let y = r.sy; y <= r.ey; ++y) {
          this.getCell(x, y).modify(EditMode.Set);
        }
      }
    }
  }

  stopMovingGroup(confirm = false) {
    this.movingGroupStart = false;
    if (this.movingGroup) {
      this.movingGroup = false;

      let g = this.currentGroup;
      let x = g.x;
      for (let y = g.start; y <= g.end; ++y) {
        if (confirm) {
          this.getCell(x, y).modify(EditMode.Clear);
        }
      }
      if (confirm) {
        let r = this.region;
        let x = r.sx;
        if (r.ex >= 0) {
          let end = Math.min(this.rows - 1, r.sy + (g.end - g.start));
          for (let y = r.sy; y <= end; ++y) {
            this.getCell(x, y).modify(EditMode.Set);
          }
        }
      }

      let r = this.region;
      this.clearHoverRegion();
      this.updateRegion(r);
      this.updateRegion({ sx: g.x, ex: g.x, sy: g.start, ey: g.end });
    }
  }

  onMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    // if (typeof window.ontouchstart != 'undefined' && event.type == 'mousedown') return;
    if (event.button == 0) {
      if (this.onInputDown(new Point(event.clientX, event.clientY))) {
        event.stopPropagation();
        event.preventDefault();
      }
    }
  }

  onTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    const t = event.touches[0];
    event.stopPropagation();
    this.onInputDown(new Point(t.clientX, t.clientY));
  }

  onMouseLeave(event: any) {
    if (!this.isMouseDown) {
      this.clearHoverRegion();
    }
    this.stopMovingGroup();
    this.stopAdjustGroup();
    this.hoverOverlay.current?.setVisible(false);
    event.preventDefault();
  }

  onBlur(event: React.FocusEvent<HTMLDivElement, Element>) {
    this.clearHoverRegion();
    this.deleteOverlay.current?.setVisible(false);
    this.onMouseLeave(event);
  }

  onMouseEnter(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (event.buttons != 1 && this.isMouseDown) {
      this.clearHoverRegion();
      this.isMouseDown = false;
    }
    event.preventDefault();
  }

  getNeigbourState(neighbour: any) {
    if (neighbour) {
      return neighbour.hover || neighbour.enabled;
    }
    return false;
  }

  updateRegion(r: { sx: any; sy?: any; ex: any; ey?: any }) {
    for (let x = r.sx; x <= r.ex; ++x) {
      this.columns[x] = [];
    }
    for (let x = r.sx; x <= r.ex; ++x) {
      let regs = [];
      if (this.movingGroup && this.currentGroup.x == x) {
        let start = this.currentGroup.start;
        let end = this.currentGroup.end;

        regs.push(this.makeRegionElement(true, x, start, end - start + 1));
      }

      let start = 0;
      let end = 0;
      for (let y = 0; y < this.rows; ++y) {
        let c = this.getCell(x, y);
        const current = c.enabled || c.hover;
        const up = this.getNeigbourState(y > 0 ? this.getCell(x, y - 1) : null);
        const down = this.getNeigbourState(y < this.rows - 1 ? this.getCell(x, y + 1) : null);

        c.setNeighbors(up, down);
        if (current && !up) {
          start = y;
        }
        if (current && !down) {
          end = y;
          for (let j = start; j <= end; ++j) {
            this.get(x, j).group = { start: start, end: end, x: x };
          }
          regs.push(this.makeRegionElement(false, x, start, end - start + 1));
        } else {
          this.get(x, y).group = { start: y, end: y, x: x };
        }
      }

      this.columns[x] = regs;
    }

    this.forceUpdate();
    this.counter++;
  }

  onInputUp(pos: Point) {
    this.isMouseDown = false;
    const rect = this.getRect();
    const p = this.getMousePos(pos);
    if (!this.isInside(p, rect)) {
      return false;
    }

    this.stopMovingGroup(true);
    this.stopAdjustGroup(true);

    let index = this.getIndex2D(p, rect);
    let c = this.get(index.x, index.y);
    let enabled = c.ref.current.enabled;

    const r = this.region;
    for (let y = r.sy; y <= r.ey; ++y) {
      for (let x = r.sx; x <= r.ex; ++x) {
        let c = this.getCell(x, y);
        c.setHover(false);
        c.modify(this.editMode);
      }
    }
    this.updateRegion(this.region);

    if (this.deleteOverlay.current && p.eq(this.startPos)) {
      let o = this.deleteOverlay.current;
      if (enabled) {
        let g = o.group;
        let visible = o.flag;
        if (
          g.start == this.currentGroup.start &&
          g.end == this.currentGroup.end &&
          g.x == this.currentGroup.x
        ) {
          visible = !visible;
        } else {
          visible = true;
        }

        let x = toPercent((this.currentGroup.x + 1) / this.cols);
        if (this.currentGroup.x > this.cols / 2) {
          x = 'calc(' + toPercent(this.currentGroup.x / this.cols) + ' - 2.5em - 5px)';
        }
        let y = (this.currentGroup.start + this.currentGroup.end) / 2;

        o.setPos(x, toPercent(y / this.rows));
        o.setVisible(visible);
        o.flag = visible;

        o.group = this.currentGroup;
      }
    }

    return true;
  }

  onMouseUp(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (event.button == 0) {
      if (this.onInputUp(new Point(event.clientX, event.clientY))) {
        event.stopPropagation();
        event.preventDefault();
      }
    }
  }

  onDeleteClick() {
    if (!this.deleteOverlay.current?.state.visible) {
      return;
    }

    let g = this.currentGroup;
    for (let y = g.start; y <= g.end; ++y) {
      this.getCell(g.x, y).clear();
    }
    this.updateRegion({ sx: g.x, ex: g.x, sy: g.start, ey: g.end });
    this.deleteOverlay.current?.setVisible(false);
    return true;
  }

  onScroll(_event: any) {
    // this.setState({
    //   scrollY: event.target.scrollTop / event.target.scrollHeight,
    // });
  }

  onKeyUp(_event: React.KeyboardEvent<HTMLDivElement>) {
    // if (event.key === 'Escape') {
    //   const rect = this.getRect();
    //   const index = this.getIndex(this.currentPos, rect);
    //   this.clearHoverRegion();
    //   this.cells[index].ref.current.setHover(true);
    //   this.startPos = this.currentPos;
    // }
  }

  onZoomReset() {
    this.setState({
      extraHeight: this.defaultExtraHeight,
    });
  }

  onZoom(dir: number) {
    let value = Math.max(this.minExtraHeight, this.state.extraHeight + dir * 0.3);
    this.setState({
      extraHeight: value,
    });
  }

  modifyColumn(index: number, mode: EditMode) {
    const r = { sx: index, ex: index, sy: 0, ey: this.rows - 1 };
    for (let y = r.sy; y <= r.ey; ++y) {
      for (let x = r.sx; x <= r.ex; ++x) {
        let c = this.getCell(x, y);
        c.modify(mode);
      }
    }
    this.updateRegion(r);
  }

  fillColumn(index: number) {
    this.modifyColumn(index, EditMode.Set);
  }

  clearColumn(index: number) {
    this.modifyColumn(index, EditMode.Clear);
  }

  dayIsEmpty(index: number) {
    return this.columns[index].length == 0;
  }

  dayIsFull(index: number) {
    if (this.columns[index].length == 1) {
      let r = this.columns[index][0];
      let g = r.ref.current?.group;
      if (g) {
        return g.start == 0 && g.end == this.rows;
      }
    }
    return false;
  }

  onClear() {
    for (let c of this.cells) {
      c.ref.current.clear();
      c.ref.current.setNeighbors(false, false);
    }
    this.deleteOverlay.current?.setVisible(false);
    let columns = [];
    for (let _d of this.days) {
      columns.push([]);
    }
    this.columns = columns;
    this.setState({
      colums: this.columns,
    });
  }

  public render() {
    let template = '';
    for (let i = 0; i < 7; ++i) {
      template += toPercent(1.0 / this.cols) + ' ';
    }
    return (
      <div className="availability-view">
        <div
          className="availability-grid"
          style={{ borderBottom: '1px solid var(--surface-border)' }}
        >
          <div style={{ width: '5em' }}></div>
          <div
            style={{
              display: 'flex',
            }}
          >
            <div
              style={{
                display: 'grid',
                width: '100%',
                gridTemplateColumns: template + 'auto',
              }}
            >
              {this.days.map((d, i) => (
                <div
                  className={'cell-day'}
                  key={'label-day-' + i.toString()}
                  style={{
                    width: '100%',
                  }}
                >
                  <div
                    className="day-input-area"
                    onClick={(e) => {
                      this.day_refs[i].current?.toggle(e);
                    }}
                  >
                    <div className="short-day">{d.substring(0, 3)}</div>
                    <div className="long-day">{d}</div>
                    <div className={`edit-icon pi ${PrimeIcons.PENCIL}`}></div>
                  </div>
                  <OverlayPanel ref={this.day_refs[i]}>
                    <div className="flex pb-3" style={{ justifyContent: 'space-between' }}>
                      <div>{d}</div>
                      <SvgRoundButton
                        path={SvgIcons.cross}
                        name="close-button"
                        onClick={() => {
                          this.day_refs[i].current?.hide();
                        }}
                      ></SvgRoundButton>
                    </div>
                    <div className="mb-4">
                      <Button
                        className="button-secondary button-small mr-2"
                        onClick={() => this.fillColumn(i)}
                        disabled={this.dayIsFull(i)}
                      >
                        Set whole day
                      </Button>
                      <Button
                        className="button-secondary button-small"
                        onClick={() => this.clearColumn(i)}
                        disabled={this.dayIsEmpty(i)}
                      >
                        Clear all
                      </Button>
                    </div>
                    {this.columns[i].map((c, j) => {
                      if (c.ref.current?.group) {
                        let g = c.ref.current?.group;
                        return (
                          <div
                            className="column-overlay-time my-2"
                            key={'column' + i + '-time' + j}
                          >
                            <div className="text">{this.indexToTimeRange(g.start, g.end)}</div>
                            <Button
                              onClick={() => {
                                const r = { sx: g.x, ex: g.x, sy: g.start, ey: g.end };
                                console.log(r);
                                for (let y = r.sy; y <= r.ey; ++y) {
                                  for (let x = r.sx; x <= r.ex; ++x) {
                                    let c = this.getCell(x, y);
                                    c.modify(EditMode.Clear);
                                  }
                                }
                                this.updateRegion(r);
                              }}
                              className={`pi button-secondary button-small icon-no-label ${PrimeIcons.TRASH}`}
                            ></Button>
                          </div>
                        );
                      }
                    })}
                    {false && (
                      <div className="flex day-time-input mt-2">
                        <div className="mr-2">
                          <TimeInputField name="time-from" label="From" buttonsVisible={false} />
                        </div>
                        <div className="mr-2">
                          <TimeInputField name="time-to" label="To" buttonsVisible={false} />
                        </div>
                      </div>
                    )}
                  </OverlayPanel>
                </div>
              ))}
            </div>
            <div style={{ width: 'var(--scrollbar-width)' }}></div>
          </div>
        </div>
        <div className="availability-grid area" onScroll={(e) => this.onScroll(e)}>
          <div className="flex h-full w-full">
            <div
              className="flex-col h-full items-center"
              style={{ top: '-0.5em', position: 'relative', width: '100%' }}
            >
              {this.hourLabels.map((d, i) => (
                <div
                  className="cell-time"
                  key={'label-time-' + i.toString()}
                  style={{
                    marginBottom: this.state.extraHeight.toString() + 'em',
                    visibility: i == 0 ? 'hidden' : 'visible',
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="flex-col h-full items-center">
              {[...Array(this.hours).keys()].map((_d, i) => (
                <div
                  key={'label-time-decor-' + i.toString()}
                  className="cell-time-gutter"
                  style={{
                    height: toPercent(1.0 / this.hours),
                    visibility: i == 0 ? 'hidden' : 'visible',
                  }}
                ></div>
              ))}
            </div>
          </div>
          <div
            ref={this.element}
            className="content flex flex-wrap items-start"
            onMouseMove={(e) => this.onMouseMove(e)}
            onMouseDown={(e) => this.onMouseDown(e)}
            onMouseUp={(e) => this.onMouseUp(e)}
            onMouseLeave={(e) => this.onMouseLeave(e)}
            onMouseEnter={(e) => this.onMouseEnter(e)}
            onTouchStart={(e) => this.onTouchStart(e)}
            onTouchEnd={(e) => this.onTouchEnd(e)}
            onTouchMove={(e) => this.onTouchMove(e)}
            onKeyUp={(e) => this.onKeyUp(e)}
            onBlur={(e) => this.onBlur(e)}
          >
            <div
              style={{
                display: 'grid',
                width: '100%',
                gridTemplateColumns: template,
              }}
            >
              {[...Array(7).keys()].map((d) => {
                let x = [];
                for (let i = 0; i < this.rows; ++i) {
                  x.push(this.get(d, i).elem);
                }
                return (
                  <div key={'col-' + d.toString()} className="flex-col day-column">
                    {x}
                  </div>
                );
              })}
            </div>

            {this.columns.map((c: any[]) => c.map((d: { element: any }) => d.element))}

            <RelativeCell className="cell-hover-cursor" data-z-index={0} ref={this.hoverOverlay}>
              {this.state.hoverOverlayText}
            </RelativeCell>

            <RelativeCell className="cell-overlay-delete" ref={this.deleteOverlay} data-z-index={8}>
              <div
                className={`delete-icon pi ${PrimeIcons.TRASH}`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onMouseUp={(e) => {
                  if (typeof window.ontouchstart != 'undefined' && e.type == 'mouseup') return;
                  this.onDeleteClick();
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  this.onDeleteClick();
                }}
                onMouseEnter={() => {
                  this.hoverOverlay.current?.setVisible(false);
                }}
                onMouseMove={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              ></div>
            </RelativeCell>
          </div>
        </div>

        <div className={'flex flex-end p-2'} style={{ justifyContent: 'flex-end' }}>
          <Button
            onClick={() => this.onClear()}
            severity="secondary"
            className={`pi button-toolbar button-delete button-secondary icon-no-label ${PrimeIcons.TRASH}`}
          ></Button>
          <span className="p-1 h-full"></span>
          <Button
            onClick={() => this.onZoom(-1)}
            style={{
              borderTopLeftRadius: 'var(--border-radius)',
              borderBottomLeftRadius: 'var(--border-radius)',
            }}
            severity="secondary"
            className={`pi button-toolbar button-zoom button-secondary icon-no-label ${PrimeIcons.SEARCH_MINUS}`}
          ></Button>
          <Button
            onClick={() => this.onZoomReset()}
            severity="secondary"
            className={`pi button-toolbar button-zoom button-secondary icon-no-label ${PrimeIcons.UNDO}`}
          ></Button>
          <Button
            onClick={() => this.onZoom(1)}
            style={{
              borderTopRightRadius: 'var(--border-radius)',
              borderBottomRightRadius: 'var(--border-radius)',
            }}
            severity="secondary"
            className={`pi button-toolbar button-zoom button-secondary icon-no-label ${PrimeIcons.SEARCH_PLUS}`}
          ></Button>
        </div>
      </div>
    );
  }
}
