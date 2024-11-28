"use client"
import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { useDrop } from "react-dnd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Draggable item for IELTS question types
interface DraggableItemProps {
  id: string;
  text: string;
  section: string;
  type: string;
}

function DraggableItem({ id, text, section, type }: DraggableItemProps) {
  const [{ isDragging }, drag] = useDrag<DraggableItemProps, void, { isDragging: boolean }>(() => ({
    type: "ITEM",
    item: { id, text, section, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      className="p-2 mb-2 bg-blue-300 rounded cursor-pointer"
      style={{
        width: "100px",
        textAlign: "center",
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {text}
    </div>
  );
}

// Drop area for placing items
interface DropAreaProps {
  setDroppedItem: (item: DraggableItemProps & { x: number; y: number }) => void;
}

function DropArea({ setDroppedItem }: DropAreaProps) {
  const [{ isOver, canDrop }, drop] = useDrop<DraggableItemProps, void, { isOver: boolean; canDrop: boolean }>(() => ({
    accept: "ITEM", 
    drop: (item: DraggableItemProps, monitor) => {
      const dropResult = monitor.getClientOffset();
      if (dropResult) {
        setDroppedItem({
          id: item.id,
          text: item.text,
          section: item.section,
          type: item.type,
          x: dropResult.x - 50,
          y: dropResult.y - 20,
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={drop as any}
      className={`h-full border-2 border-dashed ${
        isOver ? "border-green-400" : "border-gray-400"
      } ${canDrop ? "bg-gray-100" : ""}`}
      style={{ minHeight: "300px" }}
    >
      {isOver ? <p className="text-green-500">Release to drop</p> : <p>Drop here</p>}
    </div>
  );
}

function Canvas() {
  const [droppedItems, setDroppedItems] = useState<(DraggableItemProps & { x: number; y: number })[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newText, setNewText] = useState("");

  const setDroppedItem = (item: DraggableItemProps & { x: number; y: number }) => {
    setDroppedItems((prevItems) => [...prevItems, item]);
  };

  const deleteItem = (id: string) => {
    setDroppedItems(droppedItems.filter(item => item.id !== id));
  };

  const startEditing = (item: DraggableItemProps & { x: number; y: number }) => {
    setEditingItem(item.id);
    setNewText(item.text);
  };

  const saveEditing = (id: string) => {
    setDroppedItems(droppedItems.map(item => 
      item.id === id ? { ...item, text: newText } : item
    ));
    setEditingItem(null);
  };

  const convertToJson = () => {
    const json = JSON.stringify(droppedItems);
    console.log("JSON Output:", json);
    alert("JSON output logged in the console.");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen">
        <div className="w-1/4 bg-gray-200 p-4">
          <p className="text-lg font-bold">Toolbar</p>
          {/* Draggable items for IELTS sections */}
          <DraggableItem id="reading-1" text="Reading: Multiple Choice" section="Reading" type="Multiple Choice" />
          <DraggableItem id="reading-2" text="Reading: Fill in the blanks" section="Reading" type="Fill in the blanks" />
          <DraggableItem id="writing-1" text="Writing Task 1: Describe" section="Writing" type="Task 1" />
          <DraggableItem id="writing-2" text="Writing Task 2: Essay" section="Writing" type="Task 2" />
          <DraggableItem id="listening-1" text="Listening: Multiple Choice" section="Listening" type="Multiple Choice" />
          <DraggableItem id="speaking-1" text="Speaking: Task 1" section="Speaking" type="Task 1" />
        </div>
        <div className="w-3/4 bg-white p-4 border-l border-gray-300">
          <p className="text-lg font-bold">Canvas</p>
          <DropArea setDroppedItem={setDroppedItem} />

          {/* Render all dropped items */}
          {droppedItems.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-blue-300 text-center rounded"
              style={{
                position: "absolute",
                top: item.y,
                left: item.x,
                width: "100px",
              }}
            >
              {editingItem === item.id ? (
                <>
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="border p-2 mb-2 w-full"
                  />
                  <button
                    onClick={() => saveEditing(item.id)}
                    className="bg-green-500 text-white p-1 rounded"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p>{item.text}</p>
                  <button
                    onClick={() => startEditing(item)}
                    className="bg-yellow-500 text-white p-1 rounded mb-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="bg-red-500 text-white p-1 rounded"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={convertToJson}
        className="fixed bottom-5 right-5 bg-blue-500 text-white p-3 rounded"
      >
        Convert to JSON
      </button>
    </DndProvider>
  );
}

export default Canvas;

