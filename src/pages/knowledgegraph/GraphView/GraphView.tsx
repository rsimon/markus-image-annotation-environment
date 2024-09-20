import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { LinkObject, NodeObject, ForceGraphMethods } from 'react-force-graph-2d';
import { usePrevious } from '@/utils/usePrevious';
import { NODE_COLORS, LINK_COLORS, LINK_STYLES, ORANGE } from '../Styles';
import { Graph, GraphLink, GraphNode, KnowledgeGraphSettings } from '../Types';

import './GraphView.css';

interface GraphViewProps {

  graph: Graph;

  isFullscreen: boolean;

  query?: ((n: NodeObject<GraphNode>) => boolean);

  settings: KnowledgeGraphSettings;

  selected: GraphNode[];

  pinned: NodeObject<GraphNode>[];

  onBackgroundClick(): void;

  onSelect(node?: NodeObject<GraphNode>): void;

  onPin(node: NodeObject<GraphNode>): void;

}

const MAX_NODE_SIZE = 10;
const MIN_NODE_SIZE = 5;

const MAX_LINK_WIDTH = 3;
const MIN_LINK_WIDTH = 1;

let globalScale = 1;

export const GraphView = (props: GraphViewProps) => {

  const { graph, settings } = props;

  const previousPinned = usePrevious<NodeObject<GraphNode>[]>(props.pinned);

  const nodeScale = graph && (MAX_NODE_SIZE - MIN_NODE_SIZE) / (graph.maxDegree - graph.minDegree);

  const linkScale = graph && (MAX_LINK_WIDTH - MIN_LINK_WIDTH) / (graph.maxLinkWeight - graph.minLinkWeight);

  const el = useRef<HTMLDivElement>(null);

  const fg = useRef<ForceGraphMethods>();

  const [dimensions, setDimensions] = useState<[number, number] | undefined>();

  const [zoom, setZoom] = useState(1);

  const selectedIds = new Set(props.selected.map(n => n.id));

  const [hovered, setHovered] = useState<GraphNode | undefined>();

  // The highlighted neighbourhoods (if any)
  const highlighted: Set<string> | undefined = useMemo(() => {
    // No highlighted nodes if:
    // - no graph
    // - no current hover
    // - no active query
    // - no selection
    if (!graph || (!hovered && !props.query && (props.selected || []).length === 0)) return;

    // Highlighted due to hover
    const hoverNeighbourhood = 
      hovered ? [hovered.id, ...graph.getLinkedNodes(hovered.id).map(n => n.id)]: [];

    const selectedNeighbourhood = selectedIds.size > 0 
      ? props.selected.reduce<string[]>((all, selected) => (
        [...all, selected.id, ...graph.getLinkedNodes(selected.id).map(n => n.id)]
      ), []) 
      : [];

    return new Set([...hoverNeighbourhood, ...selectedNeighbourhood]);
  }, [graph, hovered, props.query, props.selected]);

  const nodesInQuery = useMemo(() => props.query
    ? new Set(graph.nodes.filter(n => props.query(n)).map(n => n.id))
    : new Set([])
  , [props.query]);

  const nodeFilter = useMemo(() => {
    if (!graph) return;

    return settings.hideIsolatedNodes 
        ? (node: NodeObject<GraphNode>) => node.degree > 0
        : undefined;
    }, [settings, graph]);

  useEffect(() => {
    if (fg.current && !settings.hideIsolatedNodes) fg.current.zoomToFit(400, 100)
  }, [settings.hideIsolatedNodes]);

  useEffect(() => {
    // Trivial solution for now
    if (previousPinned?.length > 0 && props.pinned?.length === 0) {
      previousPinned.forEach(n => {
        n.fx = undefined;
        n.fy = undefined;
      })

      fg.current.d3ReheatSimulation();
    }
  }, [props.pinned]);

  useEffect(() => {
    const onResize = () => {
      const { clientWidth, clientHeight } = el.current;
      setDimensions([clientWidth, clientHeight]);
    }

    window.addEventListener('resize', onResize);

    // Initial size
    onResize();
    
    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, [graph]);

  useEffect(() => {
    // Resize the canvas when fullscreen mode changes
    const { clientWidth, clientHeight } = el.current;
    setDimensions([clientWidth, clientHeight]);
  }, [props.isFullscreen]);

  const canvasObject = (node: NodeObject<GraphNode>, ctx: CanvasRenderingContext2D, scale: number) => {
    globalScale = scale;

    const r = nodeScale * node.degree + MIN_NODE_SIZE;

    const isOpaque =
      // All nodes are opaque if there is no current highlight set or no query
      (!highlighted && !props.query) ||
      // Hover or selection neighbourhood?
      (highlighted?.has(node.id)) ||
      // or if there's a query and the node matches it
      (props.query && props.query(node));
     
    const color = NODE_COLORS[node.type];

    ctx.globalAlpha = isOpaque ? 1 : 0.12;
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1 / scale;

    ctx.beginPath();
    ctx.arc(node.x, node.y, r / scale, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();

    const hideLabel = 
      // Faded nodes never get labels
      !isOpaque ||
      // Hide all labels
      settings.hideAllLabels ||
      // Hide this node type label
      (settings.hideNodeTypeLabels && settings.hideNodeTypeLabels.includes(node.type));

    // Faded nodes never get labels
    if (!hideLabel) {
      ctx.fillStyle = 'black'; 
      ctx.font = `${11 / scale}px Arial`;
      ctx.fillText(node.label, node.x + 12 / scale, node.y + 12 / scale); 
    }

    ctx.globalAlpha = 1;

    // Selection circle
    if (selectedIds.has(node.id)) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, (r + 1.5) / scale, 0, 2 * Math.PI, false);
      ctx.lineWidth = 3 / scale;
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(node.x, node.y, (r + 4) / scale, 0, 2 * Math.PI, false);
      ctx.lineWidth = 3 / scale;
      ctx.strokeStyle = ORANGE
      ctx.stroke();
    }
  }

  const onBackgroundClick = () => {
    props.onSelect(undefined);
    props.onBackgroundClick();
  }

  const onNodeDragEnd = (node: NodeObject<GraphNode>) => {
    // Pin this node
    node.fx = node.x;
    node.fy = node.y;

    props.onPin(node);
  }

  const onNodeHover = (node?: NodeObject<GraphNode>) => {
    setHovered(node);

    if (node)
      el.current.style.cursor = 'pointer';
    else 
      el.current.style.cursor = 'default';
  }

  const getLinkWidth = (link: LinkObject) => {
    if (highlighted || props.query) {
      const targetId: string = (link.target as any).id || link.target;
      const sourceId: string = (link.source as any).id || link.source;

      const isHidden = highlighted 
        ? !(highlighted.has(targetId) && highlighted.has(sourceId))
        : props.query && !(nodesInQuery.has(targetId) && nodesInQuery.has(sourceId));

      // Don't set to 0 because force-graph will use default width (0 is falsy!)
      return isHidden ? 0.00001 : linkScale * link.weight + MIN_LINK_WIDTH;
    } else {
      return linkScale * link.weight + MIN_LINK_WIDTH;
    }
  }

  const getLinkLabel = (link: LinkObject) => {
    const primitives = (link as GraphLink).primitives;

    const types = [...new Set(primitives.reduce<string[]>((t, p) => ([...t, p.type]), []))];

    const relations = new Set(primitives.reduce<string[]>((r, p) => p.value ? [...r, p.value] : r, []));

    if (types.length > 1) {
      console.log(types);
      return;
    }

    const t = types[0];

    if (t === 'FOLDER_CONTAINS_SUBFOLDER') {
      return 'is subfolder';
    } else if (t === 'FOLDER_CONTAINS_IMAGE') {
      return 'image is in folder';
    } else if (t === 'IS_PARENT_TYPE_OF') {
      return 'entity class hierarchy';
    } else if (t === 'HAS_ENTITY_ANNOTATION') {
      return `image has ${link.weight} entity annotations`;
    } else if (t === 'HAS_RELATED_ANNOTATION_IN') {
      return link.source === link.target 
        ? `${link.weight} relation${link.weight ===  1 ? '' : 's'} inside this image (${[...relations].join(', ')})`
        : `${link.weight} relation${link.weight === 1 ? '' : 's'} between images (${[...relations].join(', ')})`;
    } else if (t === 'IS_RELATED_VIA_ANNOTATION') {
      return link.source === link.target
        ? `${link.weight} relation${link.weight === 1 ? '' : 's'} between entities of this class (${[...relations].join(', ')})`
        : `connected via ${link.weight} relation${link.weight === 1 ? '' : 's'} (${[...relations].join(', ')})`
    }
  }

  const getLinkColor = (link: LinkObject) => {
    const primitives = (link as GraphLink).primitives;
    
    const types = [...new Set(primitives.reduce<string[]>((t, p) => ([...t, p.type]), []))];

    if (props.settings.graphMode === 'HIERARCHY') {
      // Hierarchy & annotations mode
      if (types.length === 1) {
        return LINK_COLORS[primitives[0].type];
      } else {
        return LINK_COLORS.DEFAULT;
      }
    } else {
      // Relations mode
      if (types.length === 1) {
        const t = types[0];

        const show = new Set([
          'HAS_RELATED_ANNOTATION_IN',
          'IS_RELATED_VIA_ANNOTATION',
          'FOLDER_CONTAINS_SUBFOLDER',
          'FOLDER_CONTAINS_IMAGE'
        ]);

        if (show.has(t)) {
          return LINK_COLORS[t];
        } else {
          return '#00000000'; // transparent
        }
      }
    }

    

    /*
    // Relation links get default color
    if (link.type === 'RELATION') return ORANGE;

    const toHighlight = hovered ? new Set([...selectedIds, hovered.id]) : selectedIds;
    if (toHighlight.size > 0) {
      const source = link.source as NodeObject<GraphNode>;
      const target = link.target as NodeObject<GraphNode>;

      return toHighlight.has(source.id) || toHighlight.has(target.id)
        ? ORANGE : '#ffffff00';
    } else {
      return '#ffffff00';
    }
    */
  }

  const getLinkDirectionalArrowLength = (link: LinkObject) => {
    if (!(link.type === 'RELATION') || !((link.source as NodeObject).type === 'ENTITY_TYPE')) return;
  
    const targetId: string = (link.target as any).id || link.target;
    const sourceId: string = (link.source as any).id || link.source;

    if (targetId === sourceId)
      return 0.00001;

    if (highlighted || props.query) {
      const isHidden = highlighted 
        ? !(highlighted.has(targetId) && highlighted.has(sourceId))
        : props.query && !(nodesInQuery.has(targetId) && nodesInQuery.has(sourceId));

      // Don't set to 0 because force-graph will use default width (0 is falsy!)
      return isHidden ? 0.00001 : linkScale * link.weight + MIN_LINK_WIDTH;
    } else {
      return (20 + link.value) / zoom;
    }
  }

  const getLinkCurvature = (link: LinkObject) =>
    (link.source as NodeObject).id === (link.target as NodeObject).id ? 0.5 : 0;

  const getLinkStyle = (link: LinkObject) => {
    const primitives = (link as GraphLink).primitives;
    if (primitives.length === 1) {
      return LINK_STYLES[primitives[0].type]?.map(n => n / globalScale);
    }
  }

  return (
    <div ref={el} className="graph-view w-full h-full overflow-hidden">
      {dimensions && (
        <ForceGraph2D
          ref={fg}
          width={dimensions[0]}
          height={dimensions[1]}
          graphData={graph} 
          linkColor={getLinkColor}
          linkCurvature={getLinkCurvature}
          linkDirectionalArrowColor={() => ORANGE}
          linkDirectionalArrowLength={getLinkDirectionalArrowLength}
          linkDirectionalArrowRelPos={1}
          linkLineDash={getLinkStyle}
          linkLabel={getLinkLabel}
          linkWidth={getLinkWidth}
          nodeCanvasObject={canvasObject}
          nodeLabel={settings.hideAllLabels ? (node: GraphNode) => node.label || node.id : undefined}
          nodeRelSize={1.2 * window.devicePixelRatio / zoom}
          nodeVal={n => nodeScale * n.degree + MIN_NODE_SIZE}
          nodeVisibility={nodeFilter}
          onBackgroundClick={onBackgroundClick}
          onLinkClick={onBackgroundClick}
          onNodeClick={n => props.onSelect(n as GraphNode)}
          onNodeDragEnd={onNodeDragEnd}
          onNodeHover={onNodeHover} 
          onZoomEnd={z => setZoom(z.k)}/>
      )}
    </div>
  )

}