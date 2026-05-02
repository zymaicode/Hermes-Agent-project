import { useState } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { useWidgetStore } from '../../stores/widgetStore';
import { WIDGET_LABELS } from './WidgetGrid';
import type { WidgetConfig } from '../../../electron/widget/types';
import './WidgetPanel.css';

const WIDTH_OPTIONS = [1, 2, 3, 4] as const;

export default function WidgetPanel({ onClose }: { onClose: () => void }) {
  const { layout, updateWidget, reorderWidget, resetLayout } = useWidgetStore();
  const [closing, setClosing] = useState(false);

  if (!layout) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 150);
  };

  const handleReset = () => {
    resetLayout();
  };

  const showAll = () => {
    for (const w of layout.widgets) {
      updateWidget(w.id, { visible: true });
    }
  };

  const hideAll = () => {
    for (const w of layout.widgets) {
      updateWidget(w.id, { visible: false });
    }
  };

  const sorted = [...layout.widgets].sort((a, b) => a.order - b.order);

  const moveItem = (index: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= sorted.length) return;
    reorderWidget(index, target);
  };

  const changeWidth = (widget: WidgetConfig, w: number) => {
    updateWidget(widget.id, { width: w });
  };

  return (
    <>
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', zIndex: 999,
        }}
        onClick={handleClose}
      />
      <div className={`widget-panel-overlay${closing ? ' closing' : ''}`}>
        <div className="widget-panel-header">
          <span className="widget-panel-title">Widgets</span>
          <div className="widget-panel-close" onClick={handleClose}>
            <X size={18} />
          </div>
        </div>
        <div className="widget-panel-body">
          {/* Actions */}
          <div className="widget-panel-actions">
            <button className="widget-panel-action-btn" onClick={showAll}>Show All</button>
            <button className="widget-panel-action-btn" onClick={hideAll}>Hide All</button>
          </div>

          {/* Widget List */}
          <div className="widget-panel-list">
            {sorted.map((widget, index) => (
              <div key={widget.id} className="widget-panel-item">
                {/* Visibility Toggle */}
                <button
                  className={`widget-panel-item-visible ${widget.visible ? 'on' : 'off'}`}
                  onClick={() => updateWidget(widget.id, { visible: !widget.visible })}
                />

                {/* Name */}
                <span className="widget-panel-item-name">
                  {WIDGET_LABELS[widget.id] || widget.id}
                </span>

                {/* Width Buttons */}
                <div className="widget-panel-width-btns">
                  {WIDTH_OPTIONS.map((w) => (
                    <button
                      key={w}
                      className={`widget-panel-width-btn${widget.width === w ? ' active' : ''}`}
                      onClick={() => changeWidth(widget, w)}
                    >{w}</button>
                  ))}
                </div>

                {/* Move Buttons */}
                <div className="widget-panel-move-btn" onClick={() => moveItem(index, 'up')}>
                  <ChevronUp size={14} />
                </div>
                <div className="widget-panel-move-btn" onClick={() => moveItem(index, 'down')}>
                  <ChevronDown size={14} />
                </div>
              </div>
            ))}
          </div>

          {/* Reset */}
          <button className="widget-panel-reset-btn" onClick={handleReset}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </>
  );
}
