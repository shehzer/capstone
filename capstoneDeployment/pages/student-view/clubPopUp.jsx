import React, { useState, useEffect } from 'react'
import { gql } from '@apollo/client'
import client from '../../components/apollo-client'
import PositionsTable from './positions-table'
import StudentExecCard from './student-exec'
import APILoadingScreen from './loading-screen'

const ClubPopUP = (props) => {
  const [isReadMore, setIsReadMore] = useState(true) //state to check if user has selected readmore
  const handleReadMore = () => {
    //sets isLiked to the opposite of the current isReadMore
    setIsReadMore(!isReadMore)
  }

  const [positionData, setPositionData] = useState([])
  const [clubData, setClubData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const clubName = props.clubName
  const clubId = props.clubId

  useEffect(() => {
    fetchPositions()
    fetchClub()
  }, [])

  function fetchClub() {
    const getClub = gql`
          query Query($id: ID!) {
            club(ID: $id) {
              _id
              department
              description
              name
              logoURL
              execs {
                _id
                name
                program
                role
                year
                headshotURL
              }
            }
          }
        `
    client
      .query({
        query: getClub,
        variables: { id: clubId },
      })
      .then((result) => {
        console.log(result, 'club result')
        setClubData(result.data.club)
        setIsLoading(false)
      })
      .catch((e) => {
        alert(e.message)
      })
  }

  const fetchPositions = async function () {
    const getPositions = gql`
          query Query($clubId: String) {
            getPositions(clubId: $clubId) {
              _id
              clubId
              description
              name
              numberOfOpenings
              skills {
                skill
              }
            }
          }
        `
    client
      .query({
        query: getPositions,
        variables: { clubId: clubId },
      })
      .then((result) => {
        setPositionData([...result.data.getPositions])
        setIsLoading(false)
      })
      .catch((e) => {
        alert(e.message)
      })
  }
  return (

    <div className="flex-col flex h-full w-full overflow-y-auto overflow-x-auto text-slate-800 p-3 border-gray-300" >
      <div className='flex self-center'>
        <img
          className="h-10 w-10 rounded-full"
          src={clubData.logoURL}
        ></img>
        <h1 className="px-2 text-3xl font-bold text-gray-900 self-center">
          {clubName}
        </h1>
      </div>
      {clubData.department ? (<div className="py-1 px-2 mt-1 text-sm text-gray-900 self-center bg-slate-100 rounded-lg font-semibold">
        {clubData.department}
      </div>) : null}
      <div className="px-2 py-1 mb-3 flex flex-col">
        <div className={`text-sm text-center ${isReadMore ? 'line-clamp-3' : ''}`}>
          {clubData.description}
        </div>
        <button onClick={handleReadMore} className="hover:text-slate-500 bg-none rounded text-sm font-bold self-center">
          {isReadMore ? 'Read More...' : 'Read Less...'}
        </button>
      </div>
      {isLoading ? (
        <APILoadingScreen />
      ) : (
        <div className="self-center w-full p-2">{
          positionData.length != 0 ? (<PositionsTable positions={positionData}></PositionsTable>) :
            (<div className='text-center w-full text-xl font-bold'>No Avaialble Positions</div>)}
        </div>
      )}
      <div className="flex w-full flex-wrap self-center bg-white space-x-2 px-4">
        <div className='w-full h-12 py-4 font-bold text-xl'>Executive team:</div>
        {clubData.execs
          ? clubData.execs.map((exec) => (
            <StudentExecCard data={exec}></StudentExecCard>
          ))
          : ''}
      </div>
    </div>
  )
}

export default ClubPopUP
