import { useState, useCallback } from 'react';
import { GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useWidgetStore } from '../../stores/widgetStore';
import type { WidgetConfig } from '../../../electron/widget/types';
import './WidgetGrid.css';

export const WIDGET_LABELS: Record<string, string> = {
  cpu: 'CPU Usage',
  memory: 'Memory',
  disk: 'Disk (C:)',
  gpu: 'GPU',
  health: 'Health Score',
  temperature: 'Temperature',
  memComposition: 'Memory Composition',
  diskActivity: 'Disk Activity',
  performanceHistory: 'Performance History',
  memoryDetails: 'Memory Details',
  storage: 'Storage',
};

interface WidgetGridProps {
  widgets: WidgetConfig[];
  renderContent: (widget: WidgetConfig) => React.ReactNode;
  highlighted?: Set<string>;
  layout?: string;
}

export default function WidgetGrid({ widgets, renderContent, highlighted, layout }: WidgetGridProps) {
  const { reorderWidget, setDragWidget, updateWidget } = useWidgetStore();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    setDragIndex(index);
    setDragWidget(widgets[index].id);
  }, [widgets, setDragWidget]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      reorderWidget(dragIndex, index);
    }
    setDragIndex(null);
    setDragOverIndex(null);
    setDragWidget(null);
  }, [dragIndex, reorderWidget, setDragWidget]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
    setDragWidget(null);
  }, [setDragWidget]);

  const toggleMinimized = useCallback((widget: WidgetConfig) => {
    updateWidget(widget.id, { minimized: !widget.minimized });
  }, [updateWidget]);

  const layoutClass = layout === 'vertical' || layout === 'compact' ? ` layout-${layout}` : '';
  const isVertical = layout === 'vertical';

  if (widgets.length === 0) {
    return (
      <div className={`widget-grid${layoutClass}`}>
        <div className="widget-empty-state">
          No widgets visible. Open Widget Panel to add some.
        </div>
      </div>
    );
  }

  return (
    <div className={`widget-grid${layoutClass}`}>
      {widgets.map((widget, index) => {
        const widthClass = isVertical ? 'width-4' : `width-${widget.width}`;
        const heightClass = widget.height !== 'auto' ? widget.height : '';
        const minimizedClass = widget.minimized ? 'minimized' : '';
        const draggingClass = dragIndex === index ? 'dragging' : '';
        const dragOverClass = dragOverIndex === index ? 'drag-over' : '';
        const hlClass = highlighted?.has(widget.id) ? 'highlighted' : '';

        return (
          <div
            key={widget.id}
            className={`widget-item ${widthClass} ${heightClass} ${minimizedClass} ${draggingClass} ${dragOverClass} ${hlClass} animate-fadeIn`}
            style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s`, animationFillMode: 'both' }}
          >
            {/* Drag Handle + Header */}
            <div
              className="widget-header"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
            >
              <div className="widget-drag-handle">
                <GripVertical size={14} />
              </div>
              <span className="widget-title">{WIDGET_LABELS[widget.id] || widget.id}</span>
              <div
                className="widget-collapse-btn"
                onClick={(e) => { e.stopPropagation(); toggleMinimized(widget); }}
              >
                {widget.minimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>

            {/* Body (hidden when minimized) */}
            {!widget.minimized && (
              <div className="widget-body">
                {renderContent(widget)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
