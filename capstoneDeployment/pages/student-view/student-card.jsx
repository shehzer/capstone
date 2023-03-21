import React, { useState } from 'react';
import Modal from 'react-modal';
import ClubPopUP from './clubPopUp';

Modal.setAppElement('#__next');

export default function StudentCard(props) {
  const [isReadMore, setIsReadMore] = useState(true);
  const [modalIsOpen, setIsOpen] = useState(false);

  const handleReadMore = (event) => {
    event.stopPropagation();
    setIsReadMore(!isReadMore);
  }

  const handleOpenModal = () => {
    setIsOpen(true);
  }

  const handleCloseModal = () => {
    setIsOpen(false);
  }

  return (
    <div className="rounded-lg bg-white overflow-hidden m-2 text-slate-800 flex flex-col hover:bg-gray-50 shadow-lg grow hover:animate-wiggle border border-gray-100 hover:border-gray-300">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        className="bg-white w-3/5 h-3/4 mx-auto my-auto rounded-lg shadow-lg flex items-center justify-center opacity-100"
        overlayClassName="fixed inset-0 flex justify-center items-center"
        portalClassName="opacity-100 bg-black"
      >
        <div className="w-full h-full flex flex-col items-center justify-center opacity-100 shadow-xl rounded-lg ">
          <ClubPopUP clubName={props.data.name} clubId={props.data._id} />
          <button className='text-slate-800 my-2 w-full bg-white rounded-md' onClick={handleCloseModal}>Close</button>
        </div>
      </Modal>
      <div onClick={handleOpenModal} className="cursor-pointer h-full flex flex-col">

        <h1 className="px-2 text-2xl font-bold cursor-pointer">
          {props.data.name}
        </h1>
        {props.data.department ? (<div className="py-1 mx-2 mt-1 text-sm text-gray-900 bg-slate-100 rounded-xl font-semibold w-24 text-center">
          {props.data.department}
        </div>) : null}

        <div className="px-2 pt-2 mb-3 flex-col flex h-full text-slate-500">
          <div className={`text-sm ${isReadMore && 'line-clamp-3'}`}>
            {props.data.description}
          </div>
          <button onClick={handleReadMore} className="bg-none rounded text-sm font-bold hover:text-slate-800 text-left pt-1">
            {isReadMore ? 'Read More...' : 'Read Less...'}
          </button>
        </div>
      </div>
    </div>
  );
}
