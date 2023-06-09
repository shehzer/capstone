import { Table, Row, Col, Tooltip, User, Text } from "@nextui-org/react";
import  StyledBadgeWrapper  from "../club-view/components/StyledBadge";
import  IconButtonWrapper  from "../club-view/components/IconButton";
import  EditIconWrapper  from "../club-view/components/EditIcon";
import  DeleteIconWrapper  from "../club-view/components/DeleteIcon";
import {useState, React, useEffect} from 'react'
import { Modal, Button,  Input,  Checkbox } from "@nextui-org/react";
import { gql, useMutation } from '@apollo/client'
import client from '../../components/apollo-client'

export default function tableAdmin(props) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPass2] = useState('')
    const [clubName, setClub] = useState('')
    const [oldPass, setOld] = useState('')
    const [id, setID] = useState('')
  
    const [admins, setAdmin] = useState([])

    const [visible, setVisible] = useState(false);
    const [editAction, setAction] = useState();
    const toggleHigh = ()=>{setVisible(true)}
    const toggleLow = ()=>{setVisible(false)}
    const columns = [
      { name: "NAME", uid: "name" },
      { name: "EMAIL", uid: "email" },
      { name: "PASSWORD", uid: "password" },
      { name: "CLUB", uid: "clubName"},
      { name: "ROLE", uid: "role" },
      { name: "ACTIONS", uid: "actions" },
  ];


  const getAdmins = gql`
  query Query($name: String) {
    getAdminList(name: $name) {
      adminList {
        userID
        name
        email
        password
        role
        token
        clubName
        clubID
      }
    }
  }`

  const deleteAdminM = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(ID: $id)
  }`

  const addQ = gql`
  mutation Mutation($registerInput: RegisterInput) {
    registerUser(registerInput: $registerInput) {
      clubID
      clubName
      email
      name
      password
      role
      token
      userID
    }
  }
  `


  const editQ = gql`
  mutation Mutation($changeUserInput: ChangeUserInput) {
    editUser(changeUserInput: $changeUserInput) {
      userID
      name
      email
      password
      role
      token
      clubName
      clubID
    }
  }
  `

  const setItems = async()=>
  {
    let result = await getItems()
    setAdmin([...result.data.getAdminList.adminList])
  }

  const getItems = async()=>{
    return client.query({query:getAdmins, variables:{name:null}}).then((data)=>{
      console.log(data)
      return data
    })

  }
  useEffect(()=>{

    setItems()

  },[])


    const [adminUpload] = useMutation(addQ, {
      onCompleted: (data) => {
        console.log(data);

        let temp = admins.map((element, index)=>({...element}))
        temp.push(data.registerUser)
        setAdmin([...temp])
      
      },
      onError: (err)=>{alert(err)}
          });

    

    const [deleteAdmin] = useMutation(deleteAdminM, {
      onCompleted: (data) => {
        console.log(data);
        let temp = admins.filter((element, index)=>(element.userID!=id))
        console.log(temp)
        setAdmin([...temp])

      
      },
      onError: (err)=>{alert(err)}
          });

    const [editAdmin] = useMutation(editQ, {
      onCompleted: (data) => {
        console.log(data);

        let temp = admins.map((element, index)=>({...element}))


        const newArr = temp.map((element, index)=>{
    
          if(id==element.userID)
          {
            element.name= data.editUser.name
            element.userID = data.editUser.userID
            element.clubID = data.editUser.clubID
            element.clubName = data.editUser.clubName
            element.role = data.editUser.role
            element.password = data.editUser.password
            element.token = data.editUser.token
            element.email = data.editUser.email
          }
          return element
        })

        setAdmin([...newArr])
    
      },

      onError: (err)=>{console.log(err)}
          });


  function setEdit(user, index){
    setName(user.name)
    setEmail(user.email)
    setClub(user.clubName)
    setPassword('')
    setPass2('')
    setID(user.userID)
    setOld(user.password)
  
  }

  function clear()
  {
    setName('')
    setEmail('')
    setPassword('')
    setPass2('')
    setClub('')

  }

  function handleConfirm()
  {
    switch(editAction)
    {
      case "edit":
        editUser()
        break;
      case "delete":
        deleteUser()
        break;
      case "add":
        addUser()
        break;
      default:
        return ""
    }

    toggleLow()

  }


  function addUser()
  { 
    let qInput = {registerInput:{clubName:clubName, email:email, name:name, password:password, role:"ADMIN"}}
    console.log(qInput)
    adminUpload({variables:qInput})
  }


  function editUser()
  {
    editAdmin({variables:{
      changeUserInput:{
        _id: id,
        newEmail:email,
        newName:name,
        newPassword:password,
        password:oldPass
      }
    }
  })
  }

  function deleteUser()
  {
    console.log("I am deleting", id)
    deleteAdmin({variables:{id:id}})
  }


  function renderCell(user, columnKey){

    const cellValue = user[columnKey];
    
    switch (columnKey) {
      case "name":
        return (

            <Text>{cellValue}</Text>
         
  
        );
      case "role":
        return (
          <Col>
            <Row>
              <Text b size={14} css={{ tt: "capitalize" }}>
                {cellValue}
              </Text>
            </Row>
          </Col>
        );
      case "email":
        return <StyledBadgeWrapper type={user.status}>{cellValue}</StyledBadgeWrapper>;

      case "actions":
        return (
          <Row justify="center" align="center">
            <Col css={{ d: "flex" }}>
              <Tooltip placement="leftEnd" content="Edit user">
                <IconButtonWrapper  onClick={() => {setEdit(user, columnKey);  setAction('edit'); toggleHigh();} }>
                  <EditIconWrapper  size={20} fill="#979797" />
                </IconButtonWrapper>
              </Tooltip>
            </Col>
            <Col css={{ d: "flex" }}>
              <Tooltip
                content="Delete user"
                color="error"
                placement="leftEnd"
                onClick={() => {setEdit(user, columnKey); setAction('delete'); toggleHigh();  }}
              >
                <IconButtonWrapper >
                  <DeleteIconWrapper size={20} fill="#FF0080" />
                </IconButtonWrapper>
              </Tooltip>
            </Col>
          </Row>
        );

      case "club":
        return(
          <Text>{cellValue}</Text>
        );

      case "password":
        return(

          <Col style={{alignSelf:"initial"}}>
          <Row>
            <Text b size={14} css={{ tt: "capitalize" }}>
              {"......."}
            </Text>
          </Row>
        </Col>
  
        )
      default:
        return (
          <Text>{cellValue}</Text>
        );
    }
  };
  return (

    <div>

      <Button onPress={editUser}>Press me</Button>

    <Table
      aria-label="Example table with custom cells"
      css={{
        height: "auto",
        minWidth: "100%",
      }}
      selectionMode="none"
    >
      <Table.Header columns={columns}>
        {(column) => (
          <Table.Column
            key={column.uid}
            // hideHeader={column.uid === "actions"}
            align={column.uid === "actions" ? "center" : "start"}
          >
            {column.name}
          </Table.Column>
        )}
      </Table.Header>
      <Table.Body items={admins}>
        {(item) => (
          <Table.Row key={item.userID}>
            {(columnKey) => (
               
              <Table.Cell key={item.userID+columnKey}  >{renderCell(item, columnKey)}</Table.Cell>
            )}
          </Table.Row>
        )}
      </Table.Body>
    </Table>

    <Button   onPress={()=>{clear(); setAction('add');toggleHigh() }} className="my-10 bg-blue-600">
        Add Club Credentials
    </Button>


    <Modal
        closeButton
        aria-labelledby="team-editor"
        open={visible}
        onClose={toggleLow}
      >
        <Modal.Header aria-labelledby="team-header" >
          <Text id="modal-title" size={18}>
            Admin Editor
          </Text>
        </Modal.Header>
       {editAction!="delete"?
       <Modal.Body aria-labelledby="team-body"  >
       
         <Input
          aria-labelledby="team-name"
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            label="Name"
            placeholder={name?name:"Name"}
            onChange={(e)=>{setName(e.target.value)}}
  
          />
          <Input
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            label="Email"
            placeholder={email?email:"Email"}
            onChange={(e)=>{setEmail(e.target.value)}}
            aria-labelledby="email"
           
          />

          <Input
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            label="Club"
            placeholder={clubName}
            onChange={(e)=>{setClub(e.target.value)}}
            aria-labelledby="email"
            disabled={editAction=='edit'}
           
          />

          <Input.Password
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            label={editAction=='edit'?"New Password":"Password"}
            onChange={(e)=>{setPassword(e.target.value)}}
            aria-labelledby="password"
           
          />

          <Input.Password
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            label="Confirm Password"
            onChange={(e)=>{setPass2(e.target.value)}}
            aria-labelledby="password"
           
          />    


         {password!=password2?<Text color='error'>{"Passwords do not match"}</Text>:""}

      
        </Modal.Body>
        : 
        <Modal.Body>
            <Input
            clearable
            bordered
            fullWidth
            color="primary"
            size="lg"
            disabled
            placeholder={clubName}
            aria-labelledby="team-program"
          />
      </Modal.Body>

      
      
      }
        <Modal.Footer aria-labelledby="team-footer" >
           {editAction!="delete"?<Button className="bg-blue-600"  onPress={handleConfirm} 
           disabled={editAction=="edit"?password!=password2:password!=password2||password==''}>Confirm</Button>:
           <Button className="bg-rose-600" color='error' onPress={handleConfirm}>DELETE</Button> }
            <Button  bordered color='error' onPress={toggleLow}>Cancel</Button>

        </Modal.Footer>
      </Modal>



    </div>
  );
}
