import Link from 'next/link'
import styles from 'styles/index.module.css'
import Head from 'next/head'
import { useTheme } from '@nextui-org/react'
import { CSS, Button, Loading, Input } from '@nextui-org/react'
import { useState, useRef, useEffect, localStorage, useContext } from 'react'
import { Router, useRouter } from 'next/router'
import { gql, useMutation } from '@apollo/client'
import client from '../../components/apollo-client'
import { logMissingFieldErrors } from '@apollo/client/core/ObservableQuery'
import { AuthContext } from './context/context'

export default function signIn() {
  const router = useRouter()

  const username = useRef('')
  const password = useRef('')

  const authContext = useContext(AuthContext);

  const mutationQ = gql`
      mutation Mutation($loginInput: LoginInput) {
        loginUser(loginInput: $loginInput) {
          userRole
          _id
          department
          description
          execs {
            name
            role
            year
            program
          }
          name

        }
      }
    `

    // adminList {
    //   name
    //   email
    //   password
    //   role
    //   token
    //   clubName
    //   clubID
    //   userID
    // }

const queryQ = gql`query Query($id: ID!) {
    club(ID: $id) {
      execs {
        _id
        headshotURL
        name
        program
        role
        year
      }
      logoURL
    }
  }`

  const logIn = async function () {
    client
      .mutate({
        mutation: mutationQ,
        variables: {
          loginInput: {
            email: username.current.value,
            password: password.current.value,
          },
        },
      })
      .then((data) => {

        console.log("initial", data)

        let role = data.data.loginUser.userRole

        let payload = data.data.loginUser.adminList

        if(role=="MASTER")
        {
          payload.map((item)=>(delete item.__typename))
          router.push({
            pathname: '../admin-view/admin-landing',
            query: {
              admins:JSON.stringify(payload)
            },
          })

        }
        else
        {
          let clubData = data.data.loginUser
          client.query({
            query: queryQ,
            variables: {
                id: clubData._id
            },
          })
          .then((data2) => {
      
            clubData.execs = data2.data.club.execs
            clubData.logoURL = data2.data.club.execs.logoURL
            console.log(clubData)
  
          router.push({
            pathname: 'club-landing',
            query: {
              id: clubData._id,
              name: clubData.name,
              department: clubData.department,
              description: clubData.description,
              execs: JSON.stringify(clubData.execs),
            },
          })
      
          })
          .catch((e) => {
            alert(e.message)
          })
  

        }








      })
      .catch((e) => {
        alert(e.message)
      })
  }

  return (
    <div
      className={styles.body}
      style={{
        background: 'linear-gradient(112deg, #7EE8FA -50%, #EEC0C6 50%)',
      }}
    >
      <Head>
        <title>Welcome to UES Connect</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-5xl mt-16 text-blue-500 ">Club Sign In</h1>

      <div
        style={{ display: 'flex', flexDirection: 'column', marginTop: '50px' }}
      >
        <Input
          ref={username}
          className=" bg-black mb-8"
          color="primary"
          size="xl"
          bordered
          label="Email Address"
        />
        <Input.Password
          ref={password}
          className="bg-black mb-8"
          size="xl"
          color="primary"
          bordered
          label="Password"
        />

        <Button  className='bg-blue-600' onPress={logIn}>
          Log In
        </Button>
      </div>

    </div>
  )
}
