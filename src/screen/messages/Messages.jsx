import React, { useEffect, useState } from 'react'
import { useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import supabase from '../../supabase'
import { Button, Popconfirm, Table } from 'antd'
import dayjs from 'dayjs'
import { AiOutlineDelete } from 'react-icons/ai'


const Messages = () => {
    const [searchParams] = useSearchParams()
    const user_id = searchParams.get("user_id")
    const [state, setState] = useState({
        isLoading : false,
        refresh : false
    })

    const [selectedRowKeys, setSelectedRowKeys] = useState([])

    function onSelectChange(newRows){
        setSelectedRowKeys(newRows)
    }

    const rowSelection = {
        selectedRowKeys,
        onChange : onSelectChange
    }

    function multipleDelete(){
        supabase.from('messages').delete().in('id', selectedRowKeys)
        .then(res=>{
            setState(prev => prev = {...prev, refresh : !prev.refresh})
        })
        setSelectedRowKeys([])

        refetch().then(res => {return res})
    }

    const {data, isError, isLoading, refetch} = useQuery({
        queryKey : ["messages_read", user_id],
        queryFn : async ({ queryKey })=>{
            try {
                const uid = queryKey[1]
                const result = await supabase.from("messages").select("*,attendances(fullname)").eq("user_id", uid)
                return result
            } catch (error) {
                return error
            }
        }
    })

    const columns = [
        {
            title : "id",
            dataIndex : "id",
            key : "id",
        },
        {
            title : "user_id",
            dataIndex : "user_id",
            key : "user_id",
        },
        {
            title : "fullname",
            dataIndex : "fullname",
            key : "fullname",
            render : (e, record)=>(
                <> {record.attendances.fullname} </>
            )
        },
        {
            title : "message",
            dataIndex : "message",
            key : "message",
        },
        {
            title : "created_at",
            dataIndex : "created_at",
            key : "created_at",
            render : (e)=>(
                <> {dayjs(e).format("DD-MM-YYYY HH:mm:ss")} </>
            )
        },
        {
            title : "action",
            dataIndex : "id",
            key : "action",
            render : (e, record)=>(
                <div className="flex gap-1 items-center">
                    <Button
                        type='primary'
                        icon={<AiOutlineDelete/>}
                        shape='circle'
                        size='medium'
                        danger
                        onClick={async()=>{
                            await supabase.from("messages").delete().eq("id", record.id)
                            refetch()
                        }}
                        loading={state.isLoading}
                    />
                </div>
            )
        }
    ]

  return (
    <main>
        <h1>Messages</h1>

        {selectedRowKeys.length > 0 ? (
         <Popconfirm title='yakin ingin delete?' onConfirm={multipleDelete}>
            <Button danger type='primary' size='small' loading={state.isLoading} >
                Delete {selectedRowKeys.length} rows
            </Button>
         </Popconfirm>
       ) : null}

        <Table
            columns={columns}
            dataSource={data?.data}
            rowKey={"id"}
            rowSelection={rowSelection}
        />
    </main>
  )
}

export default Messages