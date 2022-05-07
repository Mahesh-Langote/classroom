import prisma from '../prisma/prisma';
import ClassInviteTable from '../../components/ClassInviteTable';
import Head from 'next/head';
import Navbar from '../../components/navbar';
import Link from 'next/link';
import { getSession } from 'next-auth/react';
import Modal from '../../components/modal';

export async function getServerSideProps(ctx) {
  const userSession = await getSession(ctx);
  if (!userSession) {
    ctx.res.writeHead(302, { Location: '/' });
    ctx.res.end();
    return {};
  }
  const userInfo = await prisma.User.findMany({
    where: {
      email: userSession['user']['email']
    }
  });
  const classrooms = await prisma.Classroom.findMany({
    where: {
      classroomTeacherId: userInfo[0].id
    }
  });
  const output = [];
  classrooms.map(classroom =>
    output.push({
      classroomName: classroom.classroomName,
      classroomId: classroom.classroomId,
      description: classroom.description,
      createdAt: JSON.stringify(classroom.createdAt)
    })
  );

  const superblocksres = await fetch(
    'https://www.freecodecamp.org/mobile/availableSuperblocks.json'
  );
  const superblocksreq = await superblocksres.json();
  const blocks = [];
  superblocksreq['superblocks'][1].map((x, i) =>
    blocks.push({ value: i, label: x })
  );
  return {
    props: {
      userSession,
      classrooms: output,
      user: userInfo[0].id,
      certificationNames: blocks
    }
  };
}

export default function Classes({
  userSession,
  classrooms,
  user,
  certificationNames
}) {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {userSession && (
        <>
          <Navbar>
            <div className='border-solid border-2 pl-4 pr-4'>
              <Link href={'/classes'}>Classes</Link>
            </div>
            <div className='border-solid border-2 pl-4 pr-4'>
              <Link href={'/'}> Menu</Link>
            </div>
            <div className='hover:bg-[#ffbf00] shadedow-lg border-solid border-color: inherit; border-2 pl-4 pr-4 bg-[#f1be32] text-black'>
              <Link href={'/'}>Sign out</Link>
            </div>
          </Navbar>

          <div className={'text-center p-10'}>
            <h1> Copy invite code by clicking on your preferred class. </h1>
          </div>

          {<Modal userId={user} certificationNames={certificationNames} />}
          {classrooms.map(classrooms => (
            <div key={classrooms.id}>
              <a>
                <ClassInviteTable classes={classrooms}></ClassInviteTable>
              </a>
            </div>
          ))}
        </>
      )}
    </>
  );
}
