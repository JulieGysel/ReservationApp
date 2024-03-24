import React from 'react';

import './AvailabilityView.css';

import { EditMode, Cell } from './Cell';

import { Button } from 'primereact/button';
import { PrimeIcons } from 'primereact/api';

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

  className = '';
  group = { start: 0, end: -1, x: -1 };

  constructor(props: any) {
    super(props);
    this.className = props.className || '';

    this.state.width = props['data-width'];
    this.state.height = props['data-height'];
    this.state.zIndex = props['data-z-index'];
  }

  public setPos(x: string, y: string) {
    this.setState({
      x: x,
      y: y,
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

export class AvailabilityView extends React.Component {
  cellSplit = 2;
  hours = 24;
  cols = 7;
  rows = this.hours * this.cellSplit;

  cells: any;

  element = React.createRef<HTMLDivElement>();
  hoverOverlay = React.createRef<RelativeCell>();
  deleteOverlay = React.createRef<RelativeCell>();

  isMouseDown = false;
  minExtraHeight = 1.5;

  state = {
    hoverOverlayText: '',
    extraHeight: this.minExtraHeight,
  };

  startPos = new Point(0, 0);
  currentPos = {};
  currentGroup = { start: 0, end: -1, x: -1 };
  movingGroupStart = false;
  movingGroup = false;
  movingAnchor = 0;
  adjustGroupStart = false;
  adjustGroup = false;

  region = { sx: 0, sy: 0, ex: -1, ey: -1 };

  hourLabels: string[];

  editMode = EditMode.Set;

  constructor(props: {} | Readonly<{}>) {
    super(props);
    this.cells = [];
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

    this.hourLabels = [...Array(this.hours).keys()].map((i) =>
      this.indexToTime(i * this.cellSplit),
    );
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

    let cell = this.get(i2.x, i2.y);
    if (!this.isMouseDown) {
      if (!cell.ref.current.enabled) {
        this.hoverOverlay.current?.setPos(toPercent(i2.x / this.cols), toPercent(i2.y / this.rows));
        this.hoverOverlay.current?.setVisible(true);
        this.setState({
          hoverOverlayText: this.indexToTime(i2.y),
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
        start = i2;
        start.y = Math.max(0, start.y - this.movingAnchor);
        end = { x: start.x, y: Math.min(this.rows - 1, start.y + (g.end - g.start)) };
      } else if (this.adjustGroup) {
        start.y = g.start;
        end.y = Math.max(start.y, i2.y);
      } else if (this.movingGroupStart) {
        this.movingGroup = true;
        this.movingGroupStart = false;
        this.movingAnchor = i2.y - g.start;
        for (let y = g.start; y <= g.end; ++y) {
          this.getCell(g.x, y).setGhost(true);
        }
      } else if (this.adjustGroupStart) {
        this.adjustGroup = true;
        this.adjustGroupStart = false;
        for (let y = g.start; y <= g.end; ++y) {
          this.getCell(g.x, y).setGhost(true);
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

    this.currentGroup = c.group;

    if (c.ref.current.enabled) {
      if (this.getSubIndexY(p.y, rect) != c.group.end * 2 + 1) {
        this.startMovingGroup();
      } else {
        this.startAdjustGroup();
      }
    } else {
      this.stopMovingGroup();
      this.stopAdjustGroup();
    }

    return true;
  }

  startAdjustGroup() {
    this.adjustGroupStart = true;
    this.adjustGroup = false;
  }

  startMovingGroup() {
    this.movingGroupStart = true;
    this.movingGroup = false;
  }

  stopAdjustGroup(confirm = false) {
    this.adjustGroupStart = false;
    if (this.adjustGroup) {
      this.adjustGroup = false;

      let g = this.currentGroup;
      let x = g.x;
      for (let y = g.start; y <= g.end; ++y) {
        if (confirm) {
          this.getCell(x, y).modify(EditMode.Clear);
        }
        this.getCell(x, y).setGhost(false);
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
        this.getCell(x, y).setGhost(false);
      }
      if (confirm) {
        let r = this.region;
        let x = r.sx;
        let end = Math.min(this.rows - 1, r.sy + (g.end - g.start));
        for (let y = r.sy; y <= end; ++y) {
          this.getCell(x, y).modify(EditMode.Set);
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

  onMouseLeave(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!this.isMouseDown) {
      this.clearHoverRegion();
    }
    this.stopMovingGroup();
    this.stopAdjustGroup();
    this.hoverOverlay.current?.setVisible(false);
    event.preventDefault();
  }

  onMouseEnter(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (event.buttons != 1 && this.isMouseDown) {
      this.clearHoverRegion();
      this.isMouseDown = false;
    }
    event.preventDefault();
  }

  getNeigbourState(cell: any, neighbour: any) {
    let s = [false, false];
    if (neighbour) {
      s[0] = neighbour.hover || neighbour.enabled;
      if (cell.ghost) {
        s[1] = cell.hover ? neighbour.hover : neighbour.ghost;
      } else {
        s[1] = s[0];
      }
    }
    return s;
  }

  updateRegion(r: { sx: any; sy?: any; ex: any; ey?: any }) {
    for (let x = r.sx; x <= r.ex; ++x) {
      let start = 0;
      let end = 0;
      for (let y = 0; y < this.rows; ++y) {
        let c = this.getCell(x, y);
        const current = c.enabled || c.hover;
        let up = this.getNeigbourState(c, y > 0 ? this.getCell(x, y - 1) : null);
        let down = this.getNeigbourState(c, y < this.rows - 1 ? this.getCell(x, y + 1) : null);

        c.setNeighbors(up[1], down[1]);
        c.state.text = '';

        if (current && !up[0]) {
          start = y;
        }
        if (current && !down[0]) {
          end = y;
          if (start < this.rows - this.cellSplit) {
            this.getCell(x, start).state.text = this.indexToTimeRange(start, end + 1);
          }
          for (let j = start; j <= end; ++j) {
            this.get(x, j).group = { start: start, end: end, x: x };
          }
        } else {
          this.get(x, y).group = { start: y, end: y, x: x };
        }
      }
    }
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
        let visible = o.state.visible || false;
        if (
          g.start == this.currentGroup.start &&
          g.end == this.currentGroup.end &&
          g.x == this.currentGroup.x
        ) {
          visible = !visible;
        } else {
          visible = true;
        }

        o.setPos(
          toPercent(this.currentGroup.x / this.cols),
          toPercent(this.currentGroup.start / this.rows),
        );
        o.setVisible(visible);

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
    let g = this.currentGroup;
    for (let y = g.start; y <= g.end; ++y) {
      this.getCell(g.x, y).clear();
    }
    this.updateRegion({ sx: g.x, ex: g.x, sy: g.start, ey: g.end });
    this.deleteOverlay.current?.setVisible(false);
    return true;
  }

  onScroll(event: React.UIEvent<HTMLDivElement, UIEvent>) {}

  onKeyUp(event: React.KeyboardEvent<HTMLDivElement>) {
    // if (event.key === 'Escape') {
    //   const rect = this.getRect();
    //   const index = this.getIndex(this.currentPos, rect);
    //   this.clearHoverRegion();
    //   this.cells[index].ref.current.setHover(true);
    //   this.startPos = this.currentPos;
    // }
  }

  onZoom(dir: number) {
    let value = Math.max(this.minExtraHeight, this.state.extraHeight + dir * 0.3);
    this.setState({
      extraHeight: value,
    });
  }

  onClear() {
    for (let c of this.cells) {
      c.ref.current.clear();
    }
    this.deleteOverlay.current?.setVisible(false);
  }

  public render() {
    return (
      <div className="availability-view">
        <div className="availability-grid">
          <div className="cell-top-corner"></div>
          <div className="cell-top-gutter"></div>

          <div className="flex">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
              <div
                className="cell-day"
                key={'label-day-' + i.toString()}
                style={{
                  width: toPercent(1.0 / this.cols),
                }}
              >
                {d}
              </div>
            ))}
            <div className="cell-top-scroll-gutter"></div>
          </div>
        </div>
        <div className="area" onScroll={(e) => this.onScroll(e)}>
          <div className="availability-grid">
            <div
              className="flex-col h-full items-center"
              style={{ top: '-0.5em', position: 'relative' }}
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
            >
              {this.cells.map((d: { elem: any }) => d.elem)}
              <RelativeCell className="cell-hover-cursor" data-z-index={0} ref={this.hoverOverlay}>
                {this.state.hoverOverlayText}
              </RelativeCell>

              <RelativeCell
                className="cell-overlay-delete"
                ref={this.deleteOverlay}
                data-z-index={8}
              >
                <div
                  className={`pi ${PrimeIcons.TRASH}`}
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
                  onMouseMove={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  style={{
                    position: 'relative',
                    backgroundColor: 'var(--surface-600)',
                    borderRadius: '3px',
                    width: '2em',
                    height: '2em',
                    top: '-2em',
                    color: 'var(--primary-color-text)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1em',
                  }}
                ></div>
              </RelativeCell>
            </div>
          </div>
        </div>

        <div className={'flex flex-end'} style={{ justifyContent: 'flex-end' }}>
          <Button
            onClick={() => this.onZoom(-1)}
            severity="secondary"
            className={`pi ${PrimeIcons.SEARCH_MINUS}`}
          ></Button>
          <Button
            onClick={() => this.onZoom(1)}
            severity="secondary"
            className={`pi ${PrimeIcons.SEARCH_PLUS}`}
          ></Button>
          <Button
            onClick={() => this.onClear()}
            severity="secondary"
            className={`pi ${PrimeIcons.TRASH}`}
          ></Button>
        </div>
      </div>
    );
  }
}
