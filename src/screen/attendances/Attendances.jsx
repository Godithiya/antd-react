import { Button, Drawer, Form, Input, Modal, Pagination, Popconfirm, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import supabase from '../../supabase'
import dayjs from 'dayjs'
import Chance from 'chance'
import { AiOutlineDelete, AiOutlineEdit, AiOutlineMessage, AiOutlinePlus } from 'react-icons/ai'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

const Attendances = () => {
    const navigate = useNavigate()
    const chance = new Chance()
    const [state, setState] = useState({
        isLoading : false,
        refresh : false
    })

    const [ page, setPage ] = useState(1)
    const [ limit, setLimit ] = useState(10)
    const [ totalData, setTotalData ] = useState(0)

    // multiple select rows
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    function onSelectChange(newRows){
        setSelectedRowKeys(newRows)
    }
    const rowSelection = {
        selectedRowKeys,
        onChange : onSelectChange,
    }

    // drawer logic area
    const [ open, setOpen ] = useState( false )
    const [ selectedId, setSelectedId ] = useState( null )
    function handleOpenDrawer(){
        setOpen(true)
    }
    function handleCloseDrawer(){
        setOpen( false )
        setSelectedId( null )
    }

    function handleUpdateAttendances(e){
        console.info(e)
        setState(prev => prev = {...prev, isLoading : true})
        supabase.from('attendances').update({
            fullname : e.fullname,
            phone : e.phone,
            email : e.email,
            address : e.address
        }).eq('id', e.id)
        .then(res=>{
            setState(prev => prev = {...prev, isLoading : false, refresh : true})
            handleCloseDrawer()
            refetch().then(res => {return res})
        })
    }

    const column = [
        {
            title : 'id',
            dataIndex : 'id',
            key : 'id'
        },
        {
            title : 'fullname',
            dataIndex : 'fullname',
            key : 'fullname'
        },
        {
            title : 'phone',
            dataIndex : 'phone',
            key : 'phone'
        },
        {
            title : 'email',
            dataIndex : 'email',
            key : 'email'
        },
        {
            title : 'address',
            dataIndex : 'address',
            key : 'address'
        },
        {
            title : 'created_at',
            dataIndex : 'created_at',
            key : 'created_at',
            render : (e)=>(
                <> {dayjs(e).format('DD-MM-YYYY HH:mm')} </>
            )
        },
        {
            title : 'action',
            dataIndex : 'id',
            key : 'action',
            render : (e, record) => (
                <div className='flex gap-2'>
                    

                    <Button type='primary' size='medium' icon={<AiOutlineEdit/>} shape='circle' 
                        onClick={ ()=>{
                            handleOpenDrawer()
                            setSelectedId( record )
                         } }
                    />

                    <Popconfirm title='yakin ingin delete?' onConfirm={()=>{singleDelete(e)}}>
                    <Button type='primary' size='medium' danger icon={<AiOutlineDelete/>} shape='circle' />
                    </Popconfirm>

                    {record.messages.length > 0 ? (<Button
                            type='secondary'
                            size='medium'
                            icon={<AiOutlineMessage/>}
                            shape='circle'
                            className='bg-green-500 text-white hover:bg-green-400'
                            onClick={()=>{
                                navigate(`/messages?user_id=${record.id}`)
                            }}
                        />) : null}
                </div>
            )
        }
    ]

    
    function genFakeData(){
        let fakeData = []
        for(let i = 1; i <= 50 ; i++){
            fakeData.push({
                fullname : chance.name(),
                phone : chance.phone(),
                email : chance.email(),
                address : chance.address(),
            })
        }
        
        supabase.from('attendances').insert(fakeData)
        .then(res => {
            console.info(res)
        })

    }

    function singleDelete(id){
        supabase.from('attendances').delete().eq('id', id)
        .then(res => {
            console.info(res)
            setState(prev => prev = {
                ...prev,
                refresh : !prev.refresh
            })
        
            // refresh data dari react-query
            refetch().then(res => {return res})
        })
    }

    function multipleDelete(){
        supabase.from('attendances').delete().in("id", selectedRowKeys)
        .then(res => {
            setState(prev => prev = {
                ...prev,
                refresh : !prev.refresh
            })
            setSelectedRowKeys([])

                 // refresh data dari react-query
                 refetch().then(res => {return res})
        })
    }

    // MODAL ADD ATTENDANCES LOGIC
    const [ isModalOpen, setIsModalOpen ] = useState( false )

    function openModal(){
        setIsModalOpen(true)
    }

    function closeModal(){
        setIsModalOpen(false)
    }

    function handleAddAttendances(e){
        setState(prev => prev = {
            ...prev, 
            isLoading : true
        })

        supabase.from('attendances').insert(e)
        .then(res => {
            setIsModalOpen(false)
            setState({
                isLoading : false,
                refresh : true
            })

                 // refresh data dari react-query
                 refetch().then(res => {return res})
        })
    }

    // SEARCH Logic
    function handleSearch(e){
        supabase.from('attendances').select('*').ilike('fullname', `${e}%`)
        .then(res => {
            setData(res.data)
        })
    }

    // useEffect(()=>{
    //     supabase.from('attendances').select('*').order('id', 'asc')
    //     .then((res)=>{
    //         setData(res.data)
    //     })
    // }, [ state.refresh ])

    const { data, isLoading, isError, isFetching, refetch} = useQuery({
        queryKey : ['read_attendances', page, limit],
        queryFn : async ({queryKey})=>{
            try {    
                let curPage = queryKey[1]
                let curLim = queryKey[2]

                let start = (curPage - 1) * curLim
                let end = start + curLim - 1

                let {data, error, count} = await supabase.from("attendances")
                .select('*, messages(*)', { count : 'exact' })
                .order("id", { ascending : false })
                .range(start, end)

                setTotalData(count)
                return data
            } catch (error) {
                return error
            }
        }
    })

    useEffect(()=>{
        console.info(data)
    }, [data])

  return (
    <div className={`flex flex-col gap-2`}>

        <Drawer 
            title='update data' 
            onClose={ handleCloseDrawer } 
            open={ open } 
            placement='bottom'
        >
            {selectedId?.fullname ? (
                <Form onFinish={ handleUpdateAttendances } layout='vertical' className={`grid grid-cols-2 gap-4 max-w-[800px] mx-auto`}>

                    <Form.Item label='id :' name={'id'} hidden >
                        <Input/>
                    </Form.Item>

                    <Form.Item label='fullname :' name={'fullname'} initialValue={selectedId?.fullname} rules={[{
                        required : true, message : 'please enter your fullname edit' 
                    }]}>
                        <Input/>
                    </Form.Item>
            
                    <Form.Item label='email :' name={'email'} initialValue={selectedId?.email} rules={[{
                        required : true, message : 'please enter your email edit' 
                    }]}>
                        <Input/>
                    </Form.Item>
            
                    <Form.Item label='phone :' name={'phone'} initialValue={selectedId?.phone} rules={[{
                        required : true, message : 'please enter your phone edit' 
                    }]}>
                        <Input/>
                    </Form.Item>
            
                    <Form.Item label='address :' name={'address'} initialValue={selectedId?.address} rules={[{
                        required : true, message : 'please enter your address edit' 
                    }]}>
                        <Input/>
                    </Form.Item>

                    <div className={`flex gap-4`}>
                    <Button danger type='primary' htmlType='button' onClick={ handleCloseDrawer }>
                        Cancel
                    </Button>

                    <Button type='primary' htmlType='submit' loading={state.isLoading} disabled={state.isLoading}>
                        Submit
                    </Button>
                    </div>

                </Form>
            ) : null}
        </Drawer>

        <Modal open={ isModalOpen } onCancel={ closeModal } footer={false}>
            <h1 className='font-bold text-xl text-blue-500 mb-4'>
                Add Attendances
            </h1>

            <Form onFinish={ handleAddAttendances } layout='vertical' className={`grid grid-cols-2 gap-4 max-w-[800px] mx-auto`}>

                <Form.Item label='fullname :' name={'fullname'}  rules={[{
                    required : true, message : 'please enter your fullname edit' 
                }]}>
                    <Input/>
                </Form.Item>

                <Form.Item label='email :' name={'email'} rules={[{
                    required : true, message : 'please enter your email edit' 
                }]}>
                    <Input/>
                </Form.Item>

                <Form.Item label='phone :' name={'phone'} rules={[{
                    required : true, message : 'please enter your phone edit' 
                }]}>
                    <Input/>
                </Form.Item>

                <Form.Item label='address :' name={'address'} rules={[{
                    required : true, message : 'please enter your address edit' 
                }]}>
                    <Input/>
                </Form.Item>

                <div className={`flex gap-4`}>
                <Button ghost type='primary' htmlType='button' onClick={ closeModal }>
                    cancel
                </Button>

                <Button type='primary' htmlType='submit' loading={state.isLoading} disabled={state.isLoading}>
                    Submit
                </Button>
                </div>

            </Form>
        </Modal>

        <div className={`w-full h-12 flex pxx-4 my-2 items-center`}>

            <h1 className='font-bold text-2xl uppercase'>
                Attendances
            </h1>

            <Input.Search placeholder='masukan pencarian' allowClear
                className='w-[300px] ml-4'
                onSearch={ handleSearch }
            />

            <Button type='primary' className='ml-auto' onClick={ openModal }>
                Add <AiOutlinePlus/>
            </Button>

        </div>

        {/* <Button type='primary' size='small' className={`w-[15%]`} onClick={genFakeData}>
            Generated Fake Data
        </Button> */}

       {selectedRowKeys.length > 0 ? (
         <Popconfirm title='yakin ingin delete?' onConfirm={multipleDelete}>
            <Button danger type='primary' size='small' className={`w-[15%]`}>
                Delete {selectedRowKeys.length} rows
            </Button>
         </Popconfirm>
       ) : null}

        <Table 
            columns={column}
            dataSource={data}
            rowKey={'id'}
            rowSelection={rowSelection}
            pagination={false}
            loading={ isLoading }
        />

        <Pagination
            current={page}
            total={totalData}
            pageSize={limit}
            onChange={(e)=>{
                setPage(e)
                refetch().then(res => {return res})
            }}
            className={`mt-4`}
            align='end'
            showSizeChanger={true}
            onShowSizeChange={(current, pageSize)=>{
                setLimit(pageSize)
            }}
        />
        
    </div>
  )
}

export default Attendances