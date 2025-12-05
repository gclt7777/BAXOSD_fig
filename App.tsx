
import React, { useMemo } from 'react';
import { COLORS } from './constants';

// --- Configuration from Python Script ---
const NUM_ROWS = 10; // y dim
const NUM_COLS = 10; // x dim
const ACTIVE_O_INDICES = [0, 1, 2]; // O1 Group
const ACTIVE_S_INDICES = [2, 5, 6, 8]; // S1 Group

// Layout Dimensions (px)
const CELL_SIZE = 32;
const VECTOR_WIDTH = 60;
const GAP_Y_MAT = 100;
const GAP_MAT_X = 120;
const PADDING = 40; // Container padding

export default function App() {
  // Generate Matrix Data (Binary 1.0 for active intersections as per script)
  const matrixData = useMemo(() => {
    const data = [];
    for (let r = 0; r < NUM_ROWS; r++) {
      const row = [];
      for (let c = 0; c < NUM_COLS; c++) {
        // Intersection of Active O and Active S
        const isHit = ACTIVE_O_INDICES.includes(r) && ACTIVE_S_INDICES.includes(c);
        row.push(isHit ? 1.0 : 0.0);
      }
      data.push(row);
    }
    return data;
  }, []);

  // Helper for cell styling
  const getMatrixCellStyle = (r: number, c: number, val: number) => {
    const isRowActive = ACTIVE_O_INDICES.includes(r);
    const isColActive = ACTIVE_S_INDICES.includes(c);
    const isHit = val > 0;

    let backgroundColor = COLORS.INACTIVE_FILL;
    let borderColor = COLORS.WHITE;
    let opacity = 0.5; // Default inactive opacity

    if (isHit) {
      backgroundColor = COLORS.PRIMARY;
      opacity = 1;
      borderColor = COLORS.WHITE;
    } else if (isRowActive || isColActive) {
      backgroundColor = COLORS.PRIMARY_LIGHT;
      opacity = 1;
      borderColor = COLORS.WHITE;
    }

    return { backgroundColor, borderColor, opacity };
  };

  // --- SVG Coordinate Calculations ---
  // X coordinates relative to the visualization container (excluding outer padding if applied to wrapper)
  // We assume the inner container has relative positioning.
  const xYEnd = VECTOR_WIDTH;
  const xMatStart = xYEnd + GAP_Y_MAT;
  const xMatEnd = xMatStart + (NUM_COLS * CELL_SIZE);
  const xDecStart = xMatEnd + GAP_MAT_X;
  
  // O1 Group Y coordinates
  const o1StartY = ACTIVE_O_INDICES[0] * CELL_SIZE;
  const o1EndY = (ACTIVE_O_INDICES[ACTIVE_O_INDICES.length - 1] + 1) * CELL_SIZE;
  const o1MidY = (o1StartY + o1EndY) / 2;

  return (
    <div className="min-h-screen bg-white p-8 font-sans flex flex-col items-center justify-center text-slate-800">
      
      {/* Visualization Container */}
      <div className="relative p-10 bg-white rounded-xl shadow-sm border border-slate-100">
        
        {/* Flex Layout for HTML Elements */}
        <div className="flex items-start z-10 relative">
          
          {/* 1. Objective Space (Y) */}
          <div className="flex flex-col items-center">
             <h3 className="mb-4 text-center font-bold text-sm" style={{ color: COLORS.TEXT_MAIN }}>
               Objective Space<br/>(Input)
             </h3>
             <div className="relative border border-slate-300">
                {Array.from({ length: NUM_ROWS }).map((_, i) => {
                   const isActive = ACTIVE_O_INDICES.includes(i);
                   return (
                     <div 
                       key={`y-${i}`}
                       className="flex items-center justify-end px-2 border-b last:border-b-0"
                       style={{
                          width: VECTOR_WIDTH,
                          height: CELL_SIZE,
                          backgroundColor: isActive ? COLORS.PRIMARY : COLORS.INACTIVE_FILL,
                          borderColor: COLORS.WHITE,
                          borderBottomWidth: 1,
                          opacity: isActive ? 1 : 0.5,
                       }}
                     >
                        {isActive && (
                          <span className="text-white font-bold text-xs font-serif">
                            f<sub>{i+1}</sub>
                          </span>
                        )}
                     </div>
                   );
                })}
             </div>
          </div>

          {/* Spacer 1 */}
          <div style={{ width: GAP_Y_MAT }} />

          {/* 2. Inverse Mapping Matrix (T) */}
          <div className="flex flex-col items-center">
             <h3 className="mb-4 text-center font-bold text-sm" style={{ color: COLORS.TEXT_MAIN }}>
               Inverse Mapping Matrix <i>T</i><br/>(Bridge)
             </h3>
             <div 
                className="grid border border-slate-200"
                style={{
                  gridTemplateColumns: `repeat(${NUM_COLS}, ${CELL_SIZE}px)`,
                }}
              >
                 {matrixData.map((row, r) => (
                    row.map((val, c) => {
                       const style = getMatrixCellStyle(r, c, val);
                       return (
                         <div
                           key={`m-${r}-${c}`}
                           className="border box-border"
                           style={{
                             width: CELL_SIZE,
                             height: CELL_SIZE,
                             ...style
                           }}
                         />
                       );
                    })
                 ))}
             </div>
          </div>

          {/* Spacer 2 */}
          <div style={{ width: GAP_MAT_X }} />

          {/* 3. Decision Space (X) */}
          <div className="flex flex-col items-center">
             <h3 className="mb-4 text-center font-bold text-sm" style={{ color: COLORS.TEXT_MAIN }}>
               Decision Space<br/>(Output)
             </h3>
             <div className="relative border border-slate-300">
                {Array.from({ length: NUM_COLS }).map((_, i) => {
                   const isActive = ACTIVE_S_INDICES.includes(i);
                   return (
                     <div 
                       key={`x-${i}`}
                       className="flex items-center justify-start px-2 border-b last:border-b-0"
                       style={{
                          width: VECTOR_WIDTH,
                          height: CELL_SIZE,
                          backgroundColor: isActive ? COLORS.PRIMARY : COLORS.INACTIVE_FILL,
                          borderColor: COLORS.WHITE,
                          borderBottomWidth: 1,
                          opacity: isActive ? 1 : 0.5,
                       }}
                     >
                        {isActive && (
                          <span className="text-white font-bold text-xs font-serif">
                            x<sub>{i+1}</sub>
                          </span>
                        )}
                     </div>
                   );
                })}
             </div>
          </div>
        </div>

        {/* --- SVG Overlay for Connectors & Annotations --- */}
        {/* Positioned absolutely over the content area. 
            Offset by header height approx 56px (h3 + mb-4). 
            We'll assume the vectors start at y=0 inside this SVG relative to the vectors' top. 
            So we push the SVG down to match the vectors' top. */}
        <div className="absolute top-[90px] left-10 right-10 bottom-10 pointer-events-none">
          <svg className="w-full h-full overflow-visible">
            <defs>
              <marker id="arrow-primary" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.PRIMARY} />
              </marker>
            </defs>

            {/* A. Group O1 Bracket (Left) */}
            <path 
              d={`M -10 ${o1StartY} H -20 V ${o1EndY} H -10`} 
              fill="none" 
              stroke={COLORS.PRIMARY} 
              strokeWidth="2"
            />
            <text x="-30" y={o1MidY} fill={COLORS.PRIMARY} fontWeight="bold" fontSize="14" textAnchor="end" dominantBaseline="middle">
              Group O₁
            </text>

            {/* B. Flow: O1 Block -> Matrix Rows (Middle Arrow) */}
            {/* Dashed lines for block boundaries */}
            <line x1={xYEnd} y1={o1StartY} x2={xMatStart} y2={o1StartY} stroke={COLORS.PRIMARY} strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
            <line x1={xYEnd} y1={o1EndY} x2={xMatStart} y2={o1EndY} stroke={COLORS.PRIMARY} strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
            
            {/* Main Flow Arrow */}
            <line 
              x1={xYEnd + 10} y1={o1MidY} 
              x2={xMatStart - 10} y2={o1MidY} 
              stroke={COLORS.PRIMARY} 
              strokeWidth="3" 
              markerEnd="url(#arrow-primary)" 
            />

            {/* C. Flow: Matrix Cols -> Decision Variables (Curved Arrows) */}
            {ACTIVE_S_INDICES.map((idx) => {
              // Start: Bottom of Matrix Column
              const startX = xMatStart + (idx * CELL_SIZE) + (CELL_SIZE / 2);
              const startY = NUM_ROWS * CELL_SIZE; // Bottom of matrix
              
              // End: Left of Decision Cell
              const endX = xDecStart;
              const endY = (idx * CELL_SIZE) + (CELL_SIZE / 2);
              
              // Control Point for Curve: Lower Right of the gap
              // We want a curve that goes down from matrix and then right to vector? 
              // The script says: from matrix col bottom to decision vector.
              // Since Decision Vector is usually vertically aligned similarly to Matrix, 
              // but here the index `idx` maps 1:1.
              // If idx is large, endY is large. startY is fixed at bottom (320px).
              // If idx=8, endY ~ 272px. startY = 320px. 
              // Wait, the arrow goes from matrix column *bottom*? 
              // The Python script: `xyA=(col_center_x, m_y+0.2)` (bottom of plot area, i.e., bottom of matrix in our coords if Y is down)
              // `xyB=(d_x, target_y)`.
              // So yes, from bottom of matrix column to the side of the variable.
              
              const cpX = startX; // Vertical drop first?
              const cpY = Math.max(startY, endY) + 40; // Dip below?
              
              // Quadratic Bezier: M start Q cp end
              // Let's use a simple curve: Start -> (Right-ish) -> End
              // Actually, logic: Matrix Col X -> Decision Vector X.
              // We can just use a Cubic Bezier to smooth it.
              
              return (
                <path
                  key={`arrow-${idx}`}
                  d={`M ${startX} ${startY + 5} C ${startX} ${startY + 60}, ${endX - 40} ${endY}, ${endX - 5} ${endY}`}
                  fill="none"
                  stroke={COLORS.PRIMARY}
                  strokeWidth="1.5"
                  markerEnd="url(#arrow-primary)"
                />
              );
            })}

            {/* D. Group S1 Label (Right) */}
            <text x={xDecStart + VECTOR_WIDTH + 20} y={(NUM_COLS * CELL_SIZE) / 2} fill={COLORS.PRIMARY} fontWeight="bold" fontSize="14" dominantBaseline="middle">
              Group S₁
            </text>

          </svg>
        </div>

      </div>

      {/* --- Formula & Legend --- */}
      <div className="mt-12 text-center">
         <div className="text-2xl font-serif mb-3" style={{ color: COLORS.TEXT_MAIN }}>
           Δ<b className="mx-1">x</b><sub>S₁</sub> = Δ<b className="mx-1">y</b><sub>O₁</sub> · <b>T</b>(O₁, S₁)
         </div>
         
         <div className="flex items-center justify-center gap-2 text-sm text-slate-500 italic">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.PRIMARY }}></div>
            <span>Visual Logic: The activation (Gold Color) flows from the objective group to the coupled decision variables.</span>
         </div>
      </div>

    </div>
  );
}
