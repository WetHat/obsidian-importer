---
book: "[[📓 About꞉ A Byte of Python.md|A Byte of Python]]"
tags: e-book
---

# Problem Solving

# Problem Solving

We have explored various parts of the Python language and now we will take a look at how all these parts fit together, by designing and writing a program which _does_ something useful. The idea is to learn how to write a Python script on your own.

## The Problem

The problem we want to solve is:

> I want a program which creates a backup of all my important files.

Although, this is a simple problem, there is not enough information for us to get started with the solution. A little more _analysis_ is required. For example, how do we specify _which_ files are to be backed up? _How_ are they stored? _Where_ are they stored?

After analyzing the problem properly, we _design_ our program. We make a list of things about how our program should work. In this case, I have created the following list on how _I_ want it to work. If you do the design, you may not come up with the same kind of analysis since every person has their own way of doing things, so that is perfectly okay.

- The files and directories to be backed up are specified in a list.
- The backup must be stored in a main backup directory.
- The files are backed up into a zip file.
- The name of the zip archive is the current date and time.
- We use the standard `zip` command available by default in any standard GNU/Linux or Unix distribution. Note that you can use any archiving command you want as long as it has a command line interface.

> **For Windows users**
> 
> Windows users can [install](http://gnuwin32.sourceforge.net/downlinks/zip.php) the `zip` command from the [GnuWin32 project page](http://gnuwin32.sourceforge.net/packages/zip.htm) and add `C:\Program Files\GnuWin32\bin` to your system `PATH` environment variable, similar to [what we did for recognizing the python command itself](Installation.md#^dos-prompt).

## The Solution

As the design of our program is now reasonably stable, we can write the code which is an _implementation_ of our solution.

Save as `backup_ver1.py`:

```
import os
import time

# 1. The files and directories to be backed up are
# specified in a list.
# Example on Windows:
# source = ['"C:\\My Documents"']
# Example on Mac OS X and Linux:
source = ['/Users/swa/notes']
# Notice we have to use double quotes inside a string
# for names with spaces in it.  We could have also used
# a raw string by writing [r'C:\My Documents'].

# 2. The backup must be stored in a
# main backup directory
# Example on Windows:
# target_dir = 'E:\\Backup'
# Example on Mac OS X and Linux:
target_dir = '/Users/swa/backup'
# Remember to change this to which folder you will be using

# 3. The files are backed up into a zip file.
# 4. The name of the zip archive is the current date and time
target = target_dir + os.sep + \
         time.strftime('%Y%m%d%H%M%S') + '.zip'

# Create target directory if it is not present
if not os.path.exists(target_dir):
    os.mkdir(target_dir)  # make directory

# 5. We use the zip command to put the files in a zip archive
zip_command = 'zip -r {0} {1}'.format(target,
                                      ' '.join(source))

# Run the backup
print('Zip command is:')
print(zip_command)
print('Running:')
if os.system(zip_command) == 0:
    print('Successful backup to', target)
else:
    print('Backup FAILED')
```

Output:

```
$ python backup_ver1.py
Zip command is:
zip -r /Users/swa/backup/20140328084844.zip /Users/swa/notes
Running:
  adding: Users/swa/notes/ (stored 0%)
  adding: Users/swa/notes/blah1.txt (stored 0%)
  adding: Users/swa/notes/blah2.txt (stored 0%)
  adding: Users/swa/notes/blah3.txt (stored 0%)
Successful backup to /Users/swa/backup/20140328084844.zip
```

Now, we are in the _testing_ phase where we test that our program works properly. If it doesn't behave as expected, then we have to _debug_ our program i.e. remove the _bugs_ (errors) from the program.

If the above program does not work for you, copy the line printed after the `Zip command is` line in the output, paste it in the shell (on GNU/Linux and Mac OS X) / `cmd` (on Windows), see what the error is and try to fix it. Also check the zip command manual on what could be wrong. If this command succeeds, then the problem might be in the Python program itself, so check if it exactly matches the program written above.

**How It Works**

You will notice how we have converted our _design_ into _code_ in a step-by-step manner.

We make use of the `os` and `time` modules by first importing them. Then, we specify the files and directories to be backed up in the `source` list. The target directory is where we store all the backup files and this is specified in the `target_dir` variable. The name of the zip archive that we are going to create is the current date and time which we generate using the `time.strftime()` function. It will also have the `.zip` extension and will be stored in the `target_dir` directory.

Notice the use of the `os.sep` variable - this gives the directory separator according to your operating system, i.e. it will be `'/'` in GNU/Linux, Unix, macOS, and will be `'\\'` in Windows. Using `os.sep` instead of these characters directly will make our program portable and work across all of these systems.

The `time.strftime()` function takes a specification such as the one we have used in the above program. The `%Y` specification will be replaced by the year with the century. The `%m` specification will be replaced by the month as a decimal number between `01` and `12` and so on. The complete list of such specifications can be found in the [Python Reference Manual](http://docs.python.org/3/library/time.html#time.strftime).

We create the name of the target zip file using the addition operator which _concatenates_ the strings i.e. it joins the two strings together and returns a new one. Then, we create a string `zip_command` which contains the command that we are going to execute. You can check if this command works by running it in the shell (GNU/Linux terminal or DOS prompt).

The `zip` command that we are using has some options available, and one of these options is `-r`. The `-r` option specifies that the zip command should work **r**ecursively for directories, i.e. it should include all the subdirectories and files. Options are followed by the name of the zip archive to create, followed by the list of files and directories to backup. We convert the `source` list into a string using the `join` method of strings which we have already seen how to use.

Then, we finally _run_ the command using the `os.system` function which runs the command as if it was run from the _system_ i.e. in the shell - it returns `0` if the command was successfully, else it returns an error number.

Depending on the outcome of the command, we print the appropriate message that the backup has failed or succeeded.

That's it, we have created a script to take a backup of our important files!

> **Note to Windows Users**
> 
> Instead of double backslash escape sequences, you can also use raw strings. For example, use `'C:\\Documents'` or `r'C:\Documents'`. However, do _not_ use `'C:\Documents'` since you end up using an unknown escape sequence `\D`.

Now that we have a working backup script, we can use it whenever we want to take a backup of the files. This is called the _operation_ phase or the _deployment_ phase of the software.

The above program works properly, but (usually) first programs do not work exactly as you expect. For example, there might be problems if you have not designed the program properly or if you have made a mistake when typing the code, etc. Appropriately, you will have to go back to the design phase or you will have to debug your program.

## Second Version

The first version of our script works. However, we can make some refinements to it so that it can work better on a daily basis. This is called the _maintenance_ phase of the software.

One of the refinements I felt was useful is a better file-naming mechanism - using the _time_ as the name of the file within a directory with the current _date_ as a directory within the main backup directory. The first advantage is that your backups are stored in a hierarchical manner and therefore it is much easier to manage. The second advantage is that the filenames are much shorter. The third advantage is that separate directories will help you check if you have made a backup for each day since the directory would be created only if you have made a backup for that day.

Save as `backup_ver2.py`:

```
import os
import time

# 1. The files and directories to be backed up are
# specified in a list.
# Example on Windows:
# source = ['"C:\\My Documents"', 'C:\\Code']
# Example on Mac OS X and Linux:
source = ['/Users/swa/notes']
# Notice we had to use double quotes inside the string
# for names with spaces in it.

# 2. The backup must be stored in a
# main backup directory
# Example on Windows:
# target_dir = 'E:\\Backup'
# Example on Mac OS X and Linux:
target_dir = '/Users/swa/backup'
# Remember to change this to which folder you will be using

# Create target directory if it is not present
if not os.path.exists(target_dir):
    os.mkdir(target_dir)  # make directory

# 3. The files are backed up into a zip file.
# 4. The current day is the name of the subdirectory
# in the main directory.
today = target_dir + os.sep + time.strftime('%Y%m%d')
# The current time is the name of the zip archive.
now = time.strftime('%H%M%S')

# The name of the zip file
target = today + os.sep + now + '.zip'

# Create the subdirectory if it isn't already there
if not os.path.exists(today):
    os.mkdir(today)
    print('Successfully created directory', today)

# 5. We use the zip command to put the files in a zip archive
zip_command = 'zip -r {0} {1}'.format(target,
                                      ' '.join(source))

# Run the backup
print('Zip command is:')
print(zip_command)
print('Running:')
if os.system(zip_command) == 0:
    print('Successful backup to', target)
else:
    print('Backup FAILED')
```

Output:

```
$ python backup_ver2.py
Successfully created directory /Users/swa/backup/20140329
Zip command is:
zip -r /Users/swa/backup/20140329/073201.zip /Users/swa/notes
Running:
  adding: Users/swa/notes/ (stored 0%)
  adding: Users/swa/notes/blah1.txt (stored 0%)
  adding: Users/swa/notes/blah2.txt (stored 0%)
  adding: Users/swa/notes/blah3.txt (stored 0%)
Successful backup to /Users/swa/backup/20140329/073201.zip
```

**How It Works**

Most of the program remains the same. The changes are that we check if there is a directory with the current day as its name inside the main backup directory using the `os.path.exists` function. If it doesn't exist, we create it using the `os.mkdir` function.

## Third Version

The second version works fine when I do many backups, but when there are lots of backups, I am finding it hard to differentiate what the backups were for! For example, I might have made some major changes to a program or presentation, then I want to associate what those changes are with the name of the zip archive. This can be easily achieved by attaching a user-supplied comment to the name of the zip archive.

WARNING: The following program does not work, so do not be alarmed, please follow along because there's a lesson in here.

Save as `backup_ver3.py`:

```
import os
import time

# 1. The files and directories to be backed up are
# specified in a list.
# Example on Windows:
# source = ['"C:\\My Documents"', 'C:\\Code']
# Example on Mac OS X and Linux:
source = ['/Users/swa/notes']
# Notice we had to use double quotes inside the string
# for names with spaces in it.

# 2. The backup must be stored in a
# main backup directory
# Example on Windows:
# target_dir = 'E:\\Backup'
# Example on Mac OS X and Linux:
target_dir = '/Users/swa/backup'
# Remember to change this to which folder you will be using

# Create target directory if it is not present
if not os.path.exists(target_dir):
    os.mkdir(target_dir)  # make directory

# 3. The files are backed up into a zip file.
# 4. The current day is the name of the subdirectory
# in the main directory.
today = target_dir + os.sep + time.strftime('%Y%m%d')
# The current time is the name of the zip archive.
now = time.strftime('%H%M%S')

# Take a comment from the user to
# create the name of the zip file
comment = input('Enter a comment --> ')
# Check if a comment was entered
if len(comment) == 0:
    target = today + os.sep + now + '.zip'
else:
    target = today + os.sep + now + '_' + 
        comment.replace(' ', '_') + '.zip'

# Create the subdirectory if it isn't already there
if not os.path.exists(today):
    os.mkdir(today)
    print('Successfully created directory', today)

# 5. We use the zip command to put the files in a zip archive
zip_command = "zip -r {0} {1}".format(target,
                                      ' '.join(source))

# Run the backup
print('Zip command is:')
print(zip_command)
print('Running:')
if os.system(zip_command) == 0:
    print('Successful backup to', target)
else:
    print('Backup FAILED')
```

Output:

```
$ python backup_ver3.py
  File "backup_ver3.py", line 39
    target = today + os.sep + now + '_' +
                                        ^
SyntaxError: invalid syntax
```

**How This (does not) Work**

_This program does not work!_ Python says there is a syntax error which means that the script does not satisfy the structure that Python expects to see. When we observe the error given by Python, it also tells us the place where it detected the error as well. So we start _debugging_ our program from that line.

On careful observation, we see that the single logical line has been split into two physical lines but we have not specified that these two physical lines belong together. Basically, Python has found the addition operator (`+`) without any operand in that logical line and hence it doesn't know how to continue. Remember that we can specify that the logical line continues in the next physical line by the use of a backslash at the end of the physical line. So, we make this correction to our program. This correction of the program when we find errors is called _bug fixing_.

## Fourth Version

Save as `backup_ver4.py`:

```
import os
import time

# 1. The files and directories to be backed up are
# specified in a list.
# Example on Windows:
# source = ['"C:\\My Documents"', 'C:\\Code']
# Example on Mac OS X and Linux:
source = ['/Users/swa/notes']
# Notice we had to use double quotes inside the string
# for names with spaces in it.

# 2. The backup must be stored in a
# main backup directory
# Example on Windows:
# target_dir = 'E:\\Backup'
# Example on Mac OS X and Linux:
target_dir = '/Users/swa/backup'
# Remember to change this to which folder you will be using

# Create target directory if it is not present
if not os.path.exists(target_dir):
    os.mkdir(target_dir)  # make directory

# 3. The files are backed up into a zip file.
# 4. The current day is the name of the subdirectory
# in the main directory.
today = target_dir + os.sep + time.strftime('%Y%m%d')
# The current time is the name of the zip archive.
now = time.strftime('%H%M%S')

# Take a comment from the user to
# create the name of the zip file
comment = input('Enter a comment --> ')
# Check if a comment was entered
if len(comment) == 0:
    target = today + os.sep + now + '.zip'
else:
    target = today + os.sep + now + '_' + \
        comment.replace(' ', '_') + '.zip'

# Create the subdirectory if it isn't already there
if not os.path.exists(today):
    os.mkdir(today)
    print('Successfully created directory', today)

# 5. We use the zip command to put the files in a zip archive
zip_command = 'zip -r {0} {1}'.format(target,
                                      ' '.join(source))

# Run the backup
print('Zip command is:')
print(zip_command)
print('Running:')
if os.system(zip_command) == 0:
    print('Successful backup to', target)
else:
    print('Backup FAILED')
```

Output:

```
$ python backup_ver4.py
Enter a comment --> added new examples
Zip command is:
zip -r /Users/swa/backup/20140329/074122_added_new_examples.zip /Users/swa/notes
Running:
  adding: Users/swa/notes/ (stored 0%)
  adding: Users/swa/notes/blah1.txt (stored 0%)
  adding: Users/swa/notes/blah2.txt (stored 0%)
  adding: Users/swa/notes/blah3.txt (stored 0%)
Successful backup to /Users/swa/backup/20140329/074122_added_new_examples.zip
```

**How It Works**

This program now works! Let us go through the actual enhancements that we had made in version 3. We take in the user's comments using the `input` function and then check if the user actually entered something by finding out the length of the input using the `len` function. If the user has just pressed `enter` without entering anything (maybe it was just a routine backup or no special changes were made), then we proceed as we have done before.

However, if a comment was supplied, then this is attached to the name of the zip archive just before the `.zip` extension. Notice that we are replacing spaces in the comment with underscores - this is because managing filenames without spaces is much easier.

## More Refinements

The fourth version is a satisfactorily working script for most users, but there is always room for improvement. For example, you can include a _verbosity_ level for the zip command by specifying a `-v` option to make your program become more talkative or a `-q` option to make it _quiet_.

Another possible enhancement would be to allow extra files and directories to be passed to the script at the command line. We can get these names from the `sys.argv` list and we can add them to our `source` list using the `extend` method provided by the `list` class.

The most important refinement would be to not use the `os.system` way of creating archives and instead using the [zipfile](http://docs.python.org/3/library/zipfile.html) or [tarfile](http://docs.python.org/3/library/tarfile.html) built-in modules to create these archives. They are part of the standard library and available already for you to use without external dependencies on the zip program to be available on your computer.

However, I have been using the `os.system` way of creating a backup in the above examples purely for pedagogical purposes, so that the example is simple enough to be understood by everybody but real enough to be useful.

Can you try writing the fifth version that uses the [zipfile](http://docs.python.org/3/library/zipfile.html) module instead of the `os.system` call?

## The Software Development Process

We have now gone through the various _phases_ in the process of writing a software. These phases can be summarised as follows:

1. What (Analysis)
2. How (Design)
3. Do It (Implementation)
4. Test (Testing and Debugging)
5. Use (Operation or Deployment)
6. Maintain (Refinement)

A recommended way of writing programs is the procedure we have followed in creating the backup script: Do the analysis and design. Start implementing with a simple version. Test and debug it. Use it to ensure that it works as expected. Now, add any features that you want and continue to repeat the Do It-Test-Use cycle as many times as required.

Remember:

> Software is grown, not built. -- [Bill de hÓra](http://97things.oreilly.com/wiki/index.php/Great_software_is_not_built,_it_is_grown)

## Summary

We have seen how to create our own Python programs/scripts and the various stages involved in writing such programs. You may find it useful to create your own program just like we did in this chapter so that you become comfortable with Python as well as problem-solving.

Next, we will discuss object-oriented programming.