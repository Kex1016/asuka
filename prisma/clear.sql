-- Clear all the tables
delete from Club;
delete from sqlite_sequence where name='Club';
delete from Server;
delete from sqlite_sequence where name='Server';
delete from Submission;
delete from sqlite_sequence where name='Submission';
delete from User;
delete from sqlite_sequence where name='User';
delete from Vote;
delete from sqlite_sequence where name='Vote';