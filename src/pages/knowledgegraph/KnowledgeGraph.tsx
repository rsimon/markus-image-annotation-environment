import { useState } from 'react';
import { NodeObject } from 'react-force-graph-2d';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { GraphView } from './GraphView';
import { Legend } from './Legend';
import { GraphNode } from './Types';
import { useGraph } from './useGraph';
import { GraphControls } from './GraphControls';
import { SettingsPanel } from './SettingsPanel';
import { SelectionDetailsDrawer } from './SelectionDetailsDrawer';
import { useKnowledgeGraphSettings } from './KnowledgeGraphSettings';
import { GraphSearch } from './GraphSearch';

export const KnowledgeGraph = () => {

  const [selectedNodes, setSelectedNodes] = useState<NodeObject<GraphNode>[]>([]);

  const [pinnedNodes, setPinnedNodes] = useState<NodeObject<GraphNode>[]>([]);

  const { settings, setSettings } = useKnowledgeGraphSettings();

  const [query, setQuery] = useState<((n: NodeObject<GraphNode>) => boolean | undefined)>(undefined);

  const { annotations, graph, relations } = useGraph(settings);

  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const [showGraphSearch, setShowGraphSearch] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const onCloseSearch = () => {
    setQuery(undefined);
    setShowGraphSearch(false);
  }

  const onToggleSearch = () => {
    if (showGraphSearch)
      onCloseSearch();
    else
      setShowGraphSearch(true);
  }

  return (
    <div className="page-root">
      {!isFullscreen && (
        <AppNavigationSidebar />
      )}

      <main className="page graph relative overflow-x-hidden">
        {!isFullscreen && (
          <div className="absolute top-4 left-6 z-10">
            <h1 className="text-xl font-semibold tracking-tight mb-1">
              <span className="bg-white/80 backdrop-blur-sm rounded px-1 py-0.5">
                Knowledge Graph
              </span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg leading-6">
              <span className="bg-white/80 backdrop-blur-sm box-decoration-clone px-1 py-0.5 rounded">
                Explore connections between images and entities. Zoom and pan the graph with your mouse.
                Grab and pull a node to re-arrange the graph. Click a node to see more information.
              </span>
            </p>
          </div>
        )}

        <GraphView 
          graph={graph}
          isFullscreen={isFullscreen}
          relations={relations}
          settings={settings}
          selected={selectedNodes}
          pinned={pinnedNodes}
          query={query}
          onBackgroundClick={() => setShowSettingsPanel(false)}
          onPin={node => setPinnedNodes(n => ([...n, node]))}
          onSelect={node => node ? setSelectedNodes([node]) : setSelectedNodes([])} />

        <Legend 
          includeFolders={settings.includeFolders} />

        <div className="absolute top-0 right-0 h-full flex">
          <div className="relative">
            <div className="absolute right-2 bottom-16 w-[360px] p-4 overflow-hidden pointer-events-none z-10">
              <SettingsPanel 
                open={showSettingsPanel} 
                settings={settings}
                onChangeSettings={setSettings} />
            </div>
              
            <GraphControls 
              hasPinnedNodes={pinnedNodes.length > 0} 
              isFullScreen={isFullscreen} 
              isSearchOpen={showGraphSearch}
              isSettingsOpen={showSettingsPanel}
              onToggleFullscreen={() => setIsFullscreen(fullscreen => !fullscreen)}
              onToggleSearch={onToggleSearch}
              onToggleSettings={() => setShowSettingsPanel(open => !open)}
              onUnpinAllNodes={() => setPinnedNodes([])} />
          </div>

          <SelectionDetailsDrawer 
            graph={graph}
            relations={relations}
            selected={selectedNodes[0]} 
            onClose={() => setSelectedNodes([])} />
        </div>

        {showGraphSearch && (
          <GraphSearch 
            annotations={annotations}
            graph={graph} 
            isFullscreen={isFullscreen}
            query={query}
            settings={settings}
            onChangeQuery={query => setQuery(() => query)}
            onClose={onCloseSearch} />
        )}
      </main> 
    </div>
  )
  
}