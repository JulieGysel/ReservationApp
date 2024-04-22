import { SetStateAction, useState } from 'react';
import React from 'react';
import { Divider } from 'primereact/divider';
import { DataView } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';

class ResourcePreview {
  id: number;
  name: string;

  constructor(name: string, id: number) {
    this.id = id;
    this.name = name;
  }

  equals(other: ResourcePreview) {
    return other instanceof ResourcePreview && this.id === other.id && this.name === other.name;
  }
}


export const ResourceList = () => {

  const openResource = (id: number) => {
    // Later route to specific reserve
    window.location.href = "http://localhost:5173/reserve/0";
  };
  
  const copyLinkToResource = (id: number, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    navigator.clipboard.writeText("http://localhost:5173/reserve/0");
    event.stopPropagation()
  };
  
  const editResource = (id: number, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // Later route to edit
    window.location.href = "http://localhost:5173/create";
    event.stopPropagation()
  };
  
  const deleteResource = (id: number, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setResourcesMockData(prevResources =>
      prevResources.filter(resource => resource.id !== id)
    );
    event.stopPropagation()
  };

  const itemTemplate = (item: ResourcePreview) => {
    return (
  <div className="flex flex-row align-items-center justify-content-between p-3 mb-2 border-round-lg shadow-3 cursor-pointer" onClick={() => openResource(item.id)} >
    <div className="flex" >
      <div className="mr-0 md:mr-8">
        <span className="block text-900 text-lg font-semibold mb-1">{item.name}</span>
      </div>
    </div>
    <div className="mt-0 flex flex-nowrap">
        <Button className="p-button p-button-text p-button-plain p-button-rounded mr-1 p-button-icon-only" onClick={(e) => copyLinkToResource(item.id, e)} icon="pi pi-link"></Button>
        <Button className="p-button p-button-text p-button-plain p-button-rounded mr-1 p-button-icon-only" onClick={(e) => editResource(item.id, e)} icon="pi pi-pencil"></Button>
        <Button className="p-button p-button-text p-button-plain p-button-rounded mr-1 p-button-icon-only" onClick={(e) => deleteResource(item.id, e)} icon="pi pi-trash"></Button>
      </div> 
  </div>);
  };

  const [resourcesMockData, setResourcesMockData] = useState([
    new ResourcePreview('Robolab O105', 0),
    new ResourcePreview('3D tiskárna', 1),
    new ResourcePreview('Posilovna v práci', 2),
  ]);

  return (
    <>
      <h2>Resource List</h2>
      <Divider />
      <DataView 
        value={resourcesMockData}
        listTemplate={(items: ResourcePreview[]) => items.map(itemTemplate)}
      />
    </>
  );
};

